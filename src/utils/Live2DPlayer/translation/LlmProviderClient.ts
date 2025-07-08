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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 30000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "";
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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 30000,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.content[0]?.text?.trim() || "";
  }

  /**
   * Call Google Gemini API for translation
   */
  private async callGoogleAPI(
    endpoint: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    // Google Gemini doesn't support separate system prompts, so combine them
    const combinedMessage = `${systemPrompt}\n\n${userMessage}`;

    const model = this.getProviderModel();
    const generationConfig: any = {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 30000,
    };

    // Add thinking config only for Gemini 2.5 Flash family
    if (model.includes("gemini-2.5-flash")) {
      generationConfig.thinkingConfig = {
        thinkingBudget: 0,
      };
    }

    const response = await fetch(`${endpoint}?key=${this.config.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: combinedMessage }] }],
        generationConfig,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Gemini API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text?.trim() || "";
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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 30000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "";
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
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 30000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Custom API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      data.content[0]?.text?.trim() ||
      data.candidates[0]?.content?.parts[0]?.text?.trim() ||
      ""
    );
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
        return this.callGoogleAPI(endpoint, systemPrompt, userMessage);
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
