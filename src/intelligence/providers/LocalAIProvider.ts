import { AIProvider } from "./AIProvider";
import { AIProviderConfig, ModelDefinition, NormalizedRequest, NormalizedResponse, ProviderError } from "../types";

export interface LocalAIProviderConfig extends AIProviderConfig {
  endpoint: string; // e.g., "http://localhost:11434/v1" or "http://localhost:1234/v1"
}

export class LocalAIProvider implements AIProvider {
  name = "local";

  constructor(public config: LocalAIProviderConfig) {}

  private async fetchOpenAICompatible(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.endpoint.replace(/\/$/, '')}${path}`;
    
    // Add abort signal for health check timeouts and user cancellation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for local by default
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
          ...options.headers,
        },
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) throw new ProviderError("AUTHENTICATION_ERROR", "local", response);
        if (response.status === 404) throw new ProviderError("INVALID_REQUEST", "local", response, "Endpoint not found");
        throw new ProviderError("UNKNOWN_PROVIDER_ERROR", "local", response, `Local API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e instanceof ProviderError) throw e;
      if (e.name === 'AbortError') throw new ProviderError("TIMEOUT", "local", e);
      if (e.message?.includes('fetch') || e.code === 'ECONNREFUSED') {
         throw new ProviderError("PROVIDER_UNAVAILABLE", "local", e, "Local runtime is unreachable. Is it running?");
      }
      throw new ProviderError("NETWORK_ERROR", "local", e);
    }
  }

  async checkHealth(): Promise<"CONNECTED" | "DISCONNECTED" | "AUTHENTICATION_REQUIRED" | "TIMEOUT"> {
    try {
       await this.fetchOpenAICompatible('/models');
       return "CONNECTED";
    } catch (e: any) {
       if (e instanceof ProviderError) {
          if (e.category === "AUTHENTICATION_ERROR") return "AUTHENTICATION_REQUIRED";
          if (e.category === "TIMEOUT") return "TIMEOUT";
       }
       return "DISCONNECTED";
    }
  }

  async getAvailableModels(): Promise<ModelDefinition[]> {
    try {
      const data = await this.fetchOpenAICompatible('/models');
      const models: any[] = data.data || [];
      
      return models.map(m => ({
        id: m.id,
        provider: "local",
        displayName: m.id,
        contextWindow: 8192, // Local models often have 8k context, hard to query dynamic capability from standard OpenAI API
        costPer1kInput: 0,
        costPer1kOutput: 0,
        capabilities: {
          coding: 6, // Conservative estimate
          reasoning: 6,
          vision: m.id.toLowerCase().includes('vision') || m.id.toLowerCase().includes('llava'),
          structuredOutput: false,
          streaming: true,
          longContext: false
        },
        latencyTier: "low", // usually low latency since local
        availability: "high"
      }));
    } catch (e) {
      return []; // Return empty list on failure so orchestration doesn't break
    }
  }

  async executeRequest(request: NormalizedRequest): Promise<NormalizedResponse> {
    const startTime = Date.now();
    
    let messages = [];
    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }
    if (request.history) {
      messages.push(...request.history);
    }
    messages.push({ role: 'user', content: request.prompt });

    const body = {
      model: request.modelId,
      messages: messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxOutputTokens,
      stream: request.streaming || false,
    };

    try {
      const data = await this.fetchOpenAICompatible('/chat/completions', {
        method: 'POST',
        body: JSON.stringify(body),
        signal: request.abortSignal
      });

      // Simple response handling (non-streaming for now, can be extended for streaming)
      const text = data.choices?.[0]?.message?.content || "";
      const usage = data.usage;

      return {
        text,
        provider: "local",
        model: request.modelId,
        latencyMs: Date.now() - startTime,
        usage: {
          inputTokens: usage?.prompt_tokens || 0,
          outputTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0
        },
        finishReason: data.choices?.[0]?.finish_reason
      };
    } catch (e: any) {
      // Re-throw mapped errors
      if (e instanceof ProviderError) throw e;
      throw new ProviderError("UNKNOWN_PROVIDER_ERROR", "local", e);
    }
  }

  async generateText(modelId: string, prompt: string, options?: any): Promise<string> {
     const res = await this.executeRequest({ prompt, modelId, ...options });
     return res.text;
  }

  async generateStructured<T>(modelId: string, prompt: string, schema: any, options?: any): Promise<T> {
     throw new ProviderError("UNSUPPORTED_CAPABILITY", "local", null, "Structured output not natively supported by basic LocalAIProvider yet");
  }
}
