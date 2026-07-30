import OpenAI from "openai";
import { AIProvider } from "./AIProvider";
import { AIProviderConfig, ModelDefinition, NormalizedRequest, NormalizedResponse, ProviderError } from "../types";

export class OpenAIProvider implements AIProvider {
  name = "openai" as const;
  private client: OpenAI | null = null;

  constructor(public config: AIProviderConfig) {
    if (config.apiKey) {
      this.client = new OpenAI({ 
        apiKey: config.apiKey, 
        baseURL: config.baseUrl,
        organization: config.organization,
        dangerouslyAllowBrowser: true // For this specific client setup
      });
    }
  }

  async getAvailableModels(): Promise<ModelDefinition[]> {
    return [];
  }

  async executeRequest(request: NormalizedRequest): Promise<NormalizedResponse> {
    if (!this.client) {
      throw new ProviderError("AUTHENTICATION_ERROR", this.name, null, "OpenAI API key is missing");
    }

    const startTime = Date.now();
    try {
      const messages: any[] = [];
      if (request.systemInstruction) {
        messages.push({ role: "system", content: request.systemInstruction });
      }
      if (request.history) {
        messages.push(...request.history);
      }
      messages.push({ role: "user", content: request.prompt });

      const response = await this.client.chat.completions.create({
        model: request.modelId,
        messages,
        temperature: request.temperature,
        max_tokens: request.maxOutputTokens,
      });

      return {
        text: response.choices[0]?.message?.content || "",
        provider: this.name,
        model: request.modelId,
        latencyMs: Date.now() - startTime,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        finishReason: response.choices[0]?.finish_reason || "UNKNOWN"
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
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) throw new ProviderError("AUTHENTICATION_ERROR", this.name, error);
      if (error.status === 429) throw new ProviderError("RATE_LIMITED", this.name, error);
      if (error.status === 400) throw new ProviderError("INVALID_REQUEST", this.name, error);
      if (error.status === 500 || error.status === 502 || error.status === 503) throw new ProviderError("PROVIDER_UNAVAILABLE", this.name, error);
    }
    throw new ProviderError("UNKNOWN_PROVIDER_ERROR", this.name, error);
  }
}
