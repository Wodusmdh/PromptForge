with open('src/intelligence/orchestrator/ModelRouter.ts', 'r') as f:
    content = f.read()

replacement = """    if (strategy === "manual" && userPreferredModelId) {
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
    }"""

content = content.replace("""    if (strategy === "manual" && userPreferredModelId) {
      const model = this.registry.getModel(userPreferredModelId);
      if (!model) throw new Error(`Model ${userPreferredModelId} not found`);
      return {
        strategy: "manual",
        primaryModel: model,
        reasoning: "User explicitly selected this model."
      };
    }

    const candidates = this.registry.getModelsByCapabilities(requirements);
    if (candidates.length === 0) {
      throw new Error("No models satisfy the requirements.");
    }""", replacement)

with open('src/intelligence/orchestrator/ModelRouter.ts', 'w') as f:
    f.write(content)
