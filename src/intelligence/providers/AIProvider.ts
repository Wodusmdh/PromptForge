import { AIProviderConfig, ModelDefinition, NormalizedRequest, NormalizedResponse } from "../types";

export interface AIProvider {
  name: string;
  config: AIProviderConfig;
  
  getAvailableModels(): Promise<ModelDefinition[]>;
  
  executeRequest(request: NormalizedRequest): Promise<NormalizedResponse>;
  
  // Keep older ones for backwards compat temporarily, or just replace them
  generateText(modelId: string, prompt: string, options?: any): Promise<string>;
  
  generateStructured<T>(modelId: string, prompt: string, schema: any, options?: any): Promise<T>;
}
