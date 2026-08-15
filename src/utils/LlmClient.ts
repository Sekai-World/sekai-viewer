import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ILlmApiConfig {
  provider: "openai-compatible" | "anthropic" | "gemini";
  apiKey: string;
  apiEndpoint?: string;
  model?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  onRetry?: (
    attempt: number,
    maxRetries: number,
    delayMs: number,
    error: string
  ) => void;
}

export const getDefaultModelForProvider = (provider: string): string => {
  switch (provider) {
    case "openai-compatible":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-sonnet-5";
    case "gemini":
      return "gemini-2.0-flash";
    default:
      return "";
  }
};

export const getDefaultEndpointForProvider = (
  provider: string,
  model?: string
): string => {
  switch (provider) {
    case "openai-compatible":
      return "https://api.openai.com/v1";
    case "anthropic":
      return "https://api.anthropic.com";
    case "gemini":
      return `https://generativelanguage.googleapis.com/v1beta/models/${model?.trim() || "{model}"}:generateContent`;
    default:
      return "";
  }
};

export class LlmProviderClient {
  private config: ILlmApiConfig;

  constructor(config: ILlmApiConfig) {
    this.config = config;
  }

  updateConfig(config: ILlmApiConfig): void {
    this.config = config;
  }

  private getModel(): string {
    return (
      this.config.model?.trim() ||
      getDefaultModelForProvider(this.config.provider)
    );
  }

  private async callOpenAiCompatible(
    model: string,
    systemPrompt: string,
    userMessage: string,
    schema: object
  ): Promise<string> {
    // Normalise baseURL: strip trailing /chat/completions or /completions if user
    // pasted the full URL, since the SDK appends that path itself.
    let baseURL =
      this.config.apiEndpoint?.trim() || "https://api.openai.com/v1";
    baseURL = baseURL
      .replace(/\/chat\/completions$/, "")
      .replace(/\/completions$/, "");

    const client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 32000,
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_output",
          schema: schema as Record<string, unknown>,
        },
      },
    });

    const raw = response.choices?.[0]?.message?.content?.trim() ?? "";
    return this.sanitizeControlCharacters(this.stripCodeFence(raw));
  }

  private async callAnthropic(
    model: string,
    systemPrompt: string,
    userMessage: string,
    schema: object,
    toolName = "store_structured_output"
  ): Promise<string> {
    const baseURL =
      this.config.apiEndpoint?.trim() || "https://api.anthropic.com";

    const client = new Anthropic({
      apiKey: this.config.apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });

    const response = await client.messages.create({
      model,
      max_tokens: 32000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      tools: [
        {
          name: toolName,
          description: "Return the structured output matching the schema.",
          input_schema: schema as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "tool", name: toolName },
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Anthropic API returned no tool_use block");
    }
    return JSON.stringify(toolUse.input);
  }

  private async callGemini(
    model: string,
    systemPrompt: string,
    userMessage: string,
    schema: object
  ): Promise<string> {
    // The Gemini SDK uses the API key + model name; custom baseURL is not
    // supported by the JS SDK, so we fall back to axios for proxy setups.
    const customEndpoint = this.config.apiEndpoint?.trim();
    if (customEndpoint) {
      // Proxy path: use fetch directly so the user's endpoint is honoured.
      return this.callGeminiViaFetch(
        customEndpoint,
        model,
        systemPrompt,
        userMessage,
        schema
      );
    }

    const genAI = new GoogleGenerativeAI(this.config.apiKey);
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: toGeminiSchema(schema) as any,
        temperature: 0.3,
        maxOutputTokens: 32000,
      },
    });

    const result = await geminiModel.generateContent(userMessage);
    const raw = result.response.text().trim();
    return this.sanitizeControlCharacters(this.stripCodeFence(raw));
  }

  private async callGeminiViaFetch(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    schema: object
  ): Promise<string> {
    const url = endpoint.includes("{model}")
      ? endpoint.replace("{model}", model)
      : endpoint;

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: toGeminiSchema(schema),
        temperature: 0.3,
        maxOutputTokens: 32000,
      },
    };

    const resp = await fetch(`${url}?key=${this.config.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => resp.statusText);
      throw new Error(`Gemini proxy error (${resp.status}): ${text}`);
    }

    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    return this.sanitizeControlCharacters(this.stripCodeFence(raw));
  }

  async callWithStructuredOutput(
    systemPrompt: string,
    userMessage: string,
    schema: object,
    toolName = "store_structured_output"
  ): Promise<string> {
    const model = this.getModel();
    const maxRetries = this.config.enableRetry
      ? (this.config.maxRetries ?? 3)
      : 0;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        switch (this.config.provider) {
          case "openai-compatible":
            return await this.callOpenAiCompatible(
              model,
              systemPrompt,
              userMessage,
              schema
            );
          case "anthropic":
            return await this.callAnthropic(
              model,
              systemPrompt,
              userMessage,
              schema,
              toolName
            );
          case "gemini":
            return await this.callGemini(
              model,
              systemPrompt,
              userMessage,
              schema
            );
          default:
            throw new Error(`Unsupported provider: ${this.config.provider}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          const delayMs = Math.min(1000 * 2 ** attempt, 30000);
          this.config.onRetry?.(
            attempt + 1,
            maxRetries,
            delayMs,
            lastError.message
          );
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }

    throw lastError ?? new Error("Unknown error during API call");
  }

  getConfig(): ILlmApiConfig {
    return { ...this.config };
  }

  private sanitizeControlCharacters(input: string): string {
    return input.replace(/[\x00-\x1F\x7F]/g, (c) => {
      if (c === "\n" || c === "\r" || c === "\t") return c;
      return `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`;
    });
  }

  private stripCodeFence(raw: string): string {
    if (!raw) return raw;
    // Match fence at start/end (standard), or anywhere in the string (fallback)
    let m = /^\s*```[a-zA-Z]*[ \t]*\r?\n([\s\S]*?)\r?\n?```\s*$/.exec(raw);
    if (m) return m[1].trim();
    // Fallback: strip any fence pair found anywhere
    m = /```[a-zA-Z]*[ \t]*\r?\n([\s\S]*?)\r?\n?```/.exec(raw);
    return m?.[1]?.trim() || raw;
  }
}

const toGeminiSchema = (schema: unknown): unknown => {
  if (Array.isArray(schema)) return schema.map(toGeminiSchema);
  if (schema && typeof schema === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (key === "additionalProperties") continue;
      result[key] =
        key === "type" && typeof value === "string"
          ? value.toUpperCase()
          : toGeminiSchema(value);
    }
    return result;
  }
  return schema;
};
