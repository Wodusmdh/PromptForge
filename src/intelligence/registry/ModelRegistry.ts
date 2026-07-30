import { ModelDefinition } from "../types";

export class ModelRegistry {
  private models: Map<string, ModelDefinition> = new Map();

  registerModel(model: ModelDefinition): void {
    this.models.set(model.id, model);
  }

  getModel(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }

  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  getModelsByCapabilities(requirements: any): ModelDefinition[] {
    return this.getAllModels().filter(model => {
      if (requirements.minCodingCapability && model.capabilities.coding < requirements.minCodingCapability) return false;
      if (requirements.minReasoningCapability && model.capabilities.reasoning < requirements.minReasoningCapability) return false;
      if (requirements.requireVision && !model.capabilities.vision) return false;
      if (requirements.requireStructuredOutput && !model.capabilities.structuredOutput) return false;
      if (requirements.maxCostPer1k && (model.costPer1kInput > requirements.maxCostPer1k || model.costPer1kOutput > requirements.maxCostPer1k)) return false;
      if (requirements.maxLatency) {
        const tiers = { "low": 1, "medium": 2, "high": 3 };
        const reqTier = tiers[requirements.maxLatency as keyof typeof tiers];
        const modelTier = tiers[model.latencyTier as keyof typeof tiers];
        if (modelTier > reqTier) return false;
      }
      return true;
    });
  }
}

export const globalModelRegistry = new ModelRegistry();

// Register some defaults
globalModelRegistry.registerModel({
  id: "gemini-1.5-pro",
  provider: "gemini",
  displayName: "Gemini 1.5 Pro",
  contextWindow: 2000000,
  costPer1kInput: 0.0035,
  costPer1kOutput: 0.0105,
  capabilities: {
    coding: 9,
    reasoning: 9,
    vision: true,
    structuredOutput: true,
    streaming: true,
    longContext: true
  },
  latencyTier: "medium",
  availability: "high"
});

globalModelRegistry.registerModel({
  id: "gemini-1.5-flash",
  provider: "gemini",
  displayName: "Gemini 1.5 Flash",
  contextWindow: 1000000,
  costPer1kInput: 0.000075,
  costPer1kOutput: 0.0003,
  capabilities: {
    coding: 7,
    reasoning: 7,
    vision: true,
    structuredOutput: true,
    streaming: true,
    longContext: true
  },
  latencyTier: "low",
  availability: "high"
});
