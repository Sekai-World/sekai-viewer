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
   * Call OpenAI API for translation
   */
  private async callOpenAiAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string
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
   * Call Anthropic API for translation
   */
  private async callAnthropicAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string
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
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": "2023-06-01",
          },
        }
      );

      return response.data.content[0]?.text?.trim() || "";
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `Anthropic API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Call Google Gemini API for translation
   */
  private async callGoogleAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const generationConfig: any = {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 10000,
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

      return response.data.candidates[0]?.content?.parts[0]?.text?.trim() || "";
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message;
      throw new Error(
        `Google Gemini API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Call OpenRouter API for translation
   */
  private async callOpenRouterAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string
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
        `OpenRouter API error (${error.response?.status || "Unknown"}): ${message}`
      );
    }
  }

  /**
   * Call custom API for translation
   */
  private async callCustomAPI(
    endpoint: string,
    model: string,
    systemPrompt: string,
    userMessage: string
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
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      );

      return (
        response.data.choices[0]?.message?.content?.trim() ||
        response.data.content[0]?.text?.trim() ||
        response.data.candidates[0]?.content?.parts[0]?.text?.trim() ||
        ""
      );
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
   */
  async translateBatch(
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const endpoint = this.getProviderEndpoint();
    const model = this.getProviderModel();

    switch (this.config.provider) {
      case "openai":
        return this.callOpenAiAPI(endpoint, model, systemPrompt, userMessage);
      case "anthropic":
        return this.callAnthropicAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage
        );
      case "google":
        return this.callGoogleAPI(endpoint, model, systemPrompt, userMessage);
      case "openrouter":
        return this.callOpenRouterAPI(
          endpoint,
          model,
          systemPrompt,
          userMessage
        );
      case "custom":
        return this.callCustomAPI(endpoint, model, systemPrompt, userMessage);
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
