import axios, { AxiosResponse } from "axios";

/**
 * Configuration interface for LLM API providers
 */
export interface ILlmApiConfig {
  provider: "openai" | "anthropic" | "google" | "openrouter" | "custom";
  apiKey: string;
  apiEndpoint?: string;
  model?: string;
}

/**
 * Generic JSON schema describing the structured translation response
 * shared across all providers. The model must return:
 *   { "translations": ["t1", "t2", ...] }
 * where the array length matches `expectedCount`.
 */
const buildTranslationSchema = (expectedCount: number) => ({
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: { type: "string" },
      minItems: expectedCount,
      maxItems: expectedCount,
    },
  },
  required: ["translations"],
  additionalProperties: false,
});

/**
 * Gemini REST API requires uppercase enum string types. Walk the standard
 * schema and produce a Gemini-compatible copy.
 */
const buildGeminiResponseSchema = (expectedCount: number) => {
  const toGeminiType = (t: string): string => t.toUpperCase();
  return {
    type: toGeminiType("object"),
    properties: {
      translations: {
        type: toGeminiType("array"),
        items: { type: toGeminiType("string") },
        minItems: expectedCount,
        maxItems: expectedCount,
      },
    },
    required: ["translations"],
  };
};

const TRANSLATIONS_TOOL_NAME = "store_translations";

/**
 * Get default model for a given provider.
 */
export const getDefaultModelForProvider = (provider: string): string => {
  switch (provider) {
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-3.5-haiku";
    case "google":
      return "gemini-2.0-flash";
    case "openrouter":
      return "deepseek/deepseek-chat-v3-0324:free";
    default:
      return "";
  }
};

/**
 * LLM Provider API client for handling translation requests
 * Supports multiple providers with unified interface
 */
export class LlmProviderClient {
  private config: ILlmApiConfig;

  constructor(config: ILlmApiConfig) {
    this.config = config;
  }

  /**
   * Update configuration for the client
   */
  updateConfig(config: ILlmApiConfig): void {
    this.config = config;
  }

  /**
   * Get provider-specific endpoint URL
   */
  private getProviderEndpoint(): string {
    if (this.config.apiEndpoint) return this.config.apiEndpoint;

    switch (this.config.provider) {
      case "openai":
        return "https://api.openai.com/v1/chat/completions";
      case "anthropic":
        return "https://api.anthropic.com/v1/messages";
      case "google":
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.getProviderModel()}:generateContent`;
      case "openrouter":
        return "https://openrouter.ai/api/v1/chat/completions";
      case "custom":
        throw new Error("Custom API endpoint is required for custom provider");
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`);
    }
  }

  /**
   * Get provider-specific model with user override support
   */
  private getProviderModel(): string {
    // Use user-configured model if available and not empty
    if (this.config.model && this.config.model.trim()) {
      return this.config.model;
    }

    // Fall back to provider defaults
    return getDefaultModelForProvider(this.config.provider);
  }

  /**
   * Call OpenAI API for translation using structured outputs (json_schema)
   */
  private async callOpenAiAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    expectedCount: number
  ): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(
        endpoint,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 10000,
          temperature: 0.3,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translation_result",
              strict: true,
              schema: buildTranslationSchema(expectedCount),
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      return response.data.choices[0]?.message?.content?.trim() || "";
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `OpenAI API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Call Anthropic API for translation using forced tool use, which
   * guarantees the model returns structured input matching our schema.
   * This works across Claude model versions without beta headers.
   */
  private async callAnthropicAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    expectedCount: number
  ): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(
        endpoint,
        {
          model,
          max_tokens: 10000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
          tools: [
            {
              name: TRANSLATIONS_TOOL_NAME,
              description: "Return the translated strings as an ordered array.",
              input_schema: buildTranslationSchema(expectedCount),
            },
          ],
          tool_choice: {
            type: "tool",
            name: TRANSLATIONS_TOOL_NAME,
            disable_parallel_tool_use: true,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      // The forced tool_choice guarantees a tool_use block is present.
      const toolUse = (response.data.content || []).find(
        (block: any) => block.type === "tool_use"
      );
      const translations: unknown = toolUse?.input?.translations;
      if (Array.isArray(translations)) {
        return JSON.stringify({ translations });
      }
      // Fallback: any text block returned by the model.
      const textBlock = (response.data.content || []).find(
        (block: any) => block.type === "text"
      );
      return textBlock?.text?.trim() || "";
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `Anthropic API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Call Google Gemini API for translation using responseSchema +
   * responseMimeType to force JSON output matching the schema.
   */
  private async callGoogleAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    expectedCount: number
  ): Promise<string> {
    const generationConfig: any = {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 10000,
      responseMimeType: "application/json",
      responseSchema: buildGeminiResponseSchema(expectedCount),
    };

    // Add thinking config only for Gemini 2.5 Flash family
    if (model.includes("gemini-2.5-flash")) {
      generationConfig.thinkingConfig = {
        thinkingBudget: 0,
      };
    }

    const requestBody: any = {
      contents: [{ parts: [{ text: userMessage }] }],
      generationConfig,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    try {
      const response: AxiosResponse = await axios.post(
        `${endpoint}?key=${this.config.apiKey}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Gemini may wrap the JSON in a code fence despite responseMimeType;
      // fall back to extracting the first JSON object if direct text fails.
      const raw: string =
        response.data.candidates[0]?.content?.parts[0]?.text?.trim() || "";
      return stripCodeFence(raw);
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `Google Gemini API error (${
          error.response?.status || "Unknown"
        }): ${message}`
      );
    }
  }

  /**
   * Call OpenRouter API for translation. OpenRouter passes through the
   * OpenAI-compatible response_format field, so structured outputs work
   * for any underlying model that supports them.
   */
  private async callOpenRouterAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    expectedCount: number
  ): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(
        endpoint,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 10000,
          temperature: 0.3,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translation_result",
              schema: buildTranslationSchema(expectedCount),
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const raw: string =
        response.data.choices[0]?.message?.content?.trim() || "";
      return stripCodeFence(raw);
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `OpenRouter API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Call custom OpenAI-compatible API for translation. We attempt structured
   * outputs; if the endpoint rejects response_format the caller will see
   * the upstream error message.
   */
  private async callCustomAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string,
    expectedCount: number
  ): Promise<string> {
    try {
      const response: AxiosResponse = await axios.post(
        endpoint,
        {
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 10000,
          temperature: 0.3,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "translation_result",
              schema: buildTranslationSchema(expectedCount),
            },
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const raw: string =
        response.data.choices[0]?.message?.content?.trim() ||
        response.data.content?.[0]?.text?.trim() ||
        response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "";
      return stripCodeFence(raw);
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `Custom API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Perform translation using the configured provider
   * Main entry point for all provider-specific API calls
   *
   * Returns the raw structured output as a JSON string. Callers parse it,
   * typically into the shape `{ translations: string[] }`.
   */
  async translateBatch(
    systemPrompt: string,
    userMessage: string,
    expectedCount: number
  ): Promise<string> {
    const endpoint = this.getProviderEndpoint();
    const model = this.getProviderModel();

    switch (this.config.provider) {
      case "openai":
        return this.callOpenAiAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage,
          expectedCount
        );
      case "anthropic":
        return this.callAnthropicAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage,
          expectedCount
        );
      case "google":
        return this.callGoogleAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage,
          expectedCount
        );
      case "openrouter":
        return this.callOpenRouterAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage,
          expectedCount
        );
      case "custom":
        return this.callCustomAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage,
          expectedCount
        );
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Get current provider configuration
   */
  getConfig(): ILlmApiConfig {
    return { ...this.config };
  }
}

/**
 * Some providers (notably Gemini and OpenRouter passthroughs) occasionally
 * wrap JSON output in markdown code fences despite our mime-type/schema config.
 * Strip a surrounding ``` fence (with optional language tag) and return the
 * inner text unchanged if no fence is present.
 */
function stripCodeFence(raw: string): string {
  if (!raw) return raw;
  const fenceMatch = raw.match(/^```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  return raw;
}
