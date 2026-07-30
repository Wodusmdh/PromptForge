import { ModelRegistry } from "../registry/ModelRegistry";
import { RoutingStrategy, RoutingRequirements, RoutingDecision, ModelDefinition } from "../types";

export class ModelRouter {
  constructor(private registry: ModelRegistry) {}

  routeTask(
    strategy: RoutingStrategy,
    requirements: RoutingRequirements,
    userPreferredModelId?: string
  ): RoutingDecision {
    if (strategy === "manual" && userPreferredModelId) {
      const model = this.registry.getModel(userPreferredModelId);
      if (!model) throw new Error(`Model ${userPreferredModelId} not found`);
      
      if (requirements.routingMode === "LOCAL_ONLY" && model.provider !== "local") {
        throw new Error(`Model ${userPreferredModelId} is not a local model, but LOCAL_ONLY is required.`);
      }

      return {
        strategy: "manual",
        primaryModel: model,
        reasoning: "User explicitly selected this model."
      };
    }

    let candidates = this.registry.getModelsByCapabilities(requirements);
    if (requirements.routingMode === "LOCAL_ONLY") {
      candidates = candidates.filter(m => m.provider === "local");
    }

    if (candidates.length === 0) {
      throw new Error("No models satisfy the requirements.");
    }

    if (strategy === "cheapest") {
      candidates.sort((a, b) => (a.costPer1kInput + a.costPer1kOutput) - (b.costPer1kInput + b.costPer1kOutput));
      return {
        strategy: "cheapest",
        primaryModel: candidates[0],
        reasoning: "Selected model with the lowest token cost."
      };
    }

    if (strategy === "fastest") {
      const tiers = { "low": 1, "medium": 2, "high": 3 };
      candidates.sort((a, b) => tiers[a.latencyTier] - tiers[b.latencyTier]);
      return {
        strategy: "fastest",
        primaryModel: candidates[0],
        reasoning: "Selected model with the lowest latency tier."
      };
    }

    if (strategy === "quality") {
      candidates.sort((a, b) => b.capabilities.reasoning - a.capabilities.reasoning);
      return {
        strategy: "quality",
        primaryModel: candidates[0],
        reasoning: "Selected model with the highest reasoning capability."
      };
    }

    if (strategy === "ensemble") {
      candidates.sort((a, b) => b.capabilities.reasoning - a.capabilities.reasoning);
      const primary = candidates[0];
      const secondary = candidates.length > 1 ? candidates[1] : undefined;
      const synthesis = candidates.find(m => m.capabilities.reasoning >= 8) || primary;
      return {
        strategy: "ensemble",
        primaryModel: primary,
        secondaryModel: secondary,
        synthesisModel: synthesis,
        reasoning: "Selected top models for parallel generation and high-reasoning model for synthesis."
      };
    }

    // Default to balanced
    candidates.sort((a, b) => {
      const scoreA = a.capabilities.reasoning * 0.4 - (a.costPer1kInput * 100) * 0.3 - (a.latencyTier === "low" ? -1 : a.latencyTier === "medium" ? 0 : 1) * 0.3;
      const scoreB = b.capabilities.reasoning * 0.4 - (b.costPer1kInput * 100) * 0.3 - (b.latencyTier === "low" ? -1 : b.latencyTier === "medium" ? 0 : 1) * 0.3;
      return scoreB - scoreA;
    });

    return {
      strategy: "balanced",
      primaryModel: candidates[0],
      reasoning: "Selected model balancing reasoning, cost, and latency."
    };
  }
}
