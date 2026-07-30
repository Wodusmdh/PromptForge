import { GoogleGenAI } from "@google/genai";
import { AIProvider } from "./AIProvider";
import { AIProviderConfig, ModelDefinition, NormalizedRequest, NormalizedResponse, ProviderError } from "../types";

export class GeminiProvider implements AIProvider {
  name = "gemini" as const;
  private client: GoogleGenAI | null = null;

  constructor(public config: AIProviderConfig) {
    if (config.apiKey) {
      this.client = new GoogleGenAI({ apiKey: config.apiKey });
    }
  }

  async getAvailableModels(): Promise<ModelDefinition[]> {
    // In a real app we might fetch from API, but we'll return a static list or rely on registry
    return [];
  }

  async executeRequest(request: NormalizedRequest): Promise<NormalizedResponse> {
    if (!this.client) {
      throw new ProviderError("AUTHENTICATION_ERROR", this.name, null, "Gemini API key is missing");
    }

    const startTime = Date.now();
    try {
      // Setup contents based on history + prompt
      const contents = [];
      if (request.history) {
        for (const msg of request.history) {
          contents.push({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] });
        }
      }
      contents.push({ role: "user", parts: [{ text: request.prompt }] });

      const response = await this.client.models.generateContent({
        model: request.modelId,
        contents,
        config: {
          systemInstruction: request.systemInstruction,
          temperature: request.temperature,
          maxOutputTokens: request.maxOutputTokens
        }
      });

      return {
        text: response.text || "",
        provider: this.name,
        model: request.modelId,
        latencyMs: Date.now() - startTime,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount || 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        },
        finishReason: response.candidates?.[0]?.finishReason || "UNKNOWN"
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
     // Simplified mock for now
     const res = await this.executeRequest({ prompt, modelId, ...options });
     return JSON.parse(res.text);
  }

  private handleError(error: any): never {
    if (error?.status === 401 || error?.status === 403) {
      throw new ProviderError("AUTHENTICATION_ERROR", this.name, error);
    } else if (error?.status === 429) {
      throw new ProviderError("RATE_LIMITED", this.name, error);
    } else if (error?.message?.includes("timeout")) {
      throw new ProviderError("TIMEOUT", this.name, error);
    }
    throw new ProviderError("UNKNOWN_PROVIDER_ERROR", this.name, error);
  }
}
