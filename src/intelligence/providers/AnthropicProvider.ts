import Anthropic from "@anthropic-ai/sdk";
import { AIProvider } from "./AIProvider";
import { AIProviderConfig, ModelDefinition, NormalizedRequest, NormalizedResponse, ProviderError } from "../types";

export class AnthropicProvider implements AIProvider {
  name = "anthropic" as const;
  private client: Anthropic | null = null;

  constructor(public config: AIProviderConfig) {
    if (config.apiKey) {
      this.client = new Anthropic({ 
        apiKey: config.apiKey, 
        baseURL: config.baseUrl,
        dangerouslyAllowBrowser: true // For this client setup
      });
    }
  }

  async getAvailableModels(): Promise<ModelDefinition[]> {
    return [];
  }

  async executeRequest(request: NormalizedRequest): Promise<NormalizedResponse> {
    if (!this.client) {
      throw new ProviderError("AUTHENTICATION_ERROR", this.name, null, "Anthropic API key is missing");
    }

    const startTime = Date.now();
    try {
      const messages: any[] = [];
      if (request.history) {
        messages.push(...request.history);
      }
      messages.push({ role: "user", content: request.prompt });

      const response = await this.client.messages.create({
        model: request.modelId,
        messages,
        system: request.systemInstruction,
        temperature: request.temperature,
        max_tokens: request.maxOutputTokens || 4000,
      });

      return {
        text: response.content[0].type === "text" ? response.content[0].text : "",
        provider: this.name,
        model: request.modelId,
        latencyMs: Date.now() - startTime,
        usage: {
          inputTokens: response.usage.input_tokens || 0,
          outputTokens: response.usage.output_tokens || 0,
          totalTokens: (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0)
        },
        finishReason: response.stop_reason || "UNKNOWN"
      };
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async generateText(modelId: string, prompt: string, options?: any): Promise<string> {
    const res = await this.executeRequest({ prompt, modelId, ...options });
    return res.text;
  }

  async generateStructured<T>(modelId: string, prompt: string, schema: any, options?: any): Promise<T> {
     const res = await this.executeRequest({ prompt, modelId, ...options });
     return JSON.parse(res.text);
  }

  private handleError(error: any): never {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) throw new ProviderError("AUTHENTICATION_ERROR", this.name, error);
      if (error.status === 429) throw new ProviderError("RATE_LIMITED", this.name, error);
      if (error.status === 400) throw new ProviderError("INVALID_REQUEST", this.name, error);
      if (error.status === 500 || error.status === 502 || error.status === 503) throw new ProviderError("PROVIDER_UNAVAILABLE", this.name, error);
    }
    throw new ProviderError("UNKNOWN_PROVIDER_ERROR", this.name, error);
  }
}
