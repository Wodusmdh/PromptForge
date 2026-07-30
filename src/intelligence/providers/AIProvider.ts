import { AIProviderConfig, ModelDefinition } from "../types";

export interface AIProvider {
  name: string;
  config: AIProviderConfig;
  
  getAvailableModels(): Promise<ModelDefinition[]>;
  
  generateText(modelId: string, prompt: string, options?: any): Promise<string>;
  
  generateStructured<T>(modelId: string, prompt: string, schema: any, options?: any): Promise<T>;
}
