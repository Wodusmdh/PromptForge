import { AIProvider } from "../providers/AIProvider";
import { ModelRouter } from "./ModelRouter";
import { globalModelRegistry } from "../registry/ModelRegistry";
import { RoutingStrategy, RoutingRequirements, OrchestrationRun, RoutingDecision } from "../types";

export class MultiLLMOrchestrator {
  private providers: Map<string, AIProvider> = new Map();
  private router = new ModelRouter(globalModelRegistry);
  private currentBudget: number = 0;

  constructor(private maxGlobalBudget: number = 1.0) {}

  registerProvider(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  private checkBudget(estimatedCost: number): void {
    if (this.currentBudget + estimatedCost > this.maxGlobalBudget) {
      throw new Error(`Budget exceeded. Estimated: ${estimatedCost}, Remaining: ${this.maxGlobalBudget - this.currentBudget}`);
    }
  }

  async runOrchestration(
    taskId: string,
    prompt: string,
    strategy: RoutingStrategy,
    requirements: RoutingRequirements,
    userPreferredModelId?: string
  ): Promise<OrchestrationRun> {
    const run: OrchestrationRun = {
      id: crypto.randomUUID(),
      taskId,
      state: "ANALYZING",
      decision: null,
      budgetConsumed: 0,
      maxBudget: this.maxGlobalBudget,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      result: null,
      warnings: []
    };

    try {
      run.state = "ROUTING";
      const decision = this.router.routeTask(strategy, requirements, userPreferredModelId);
      run.decision = decision;

      run.state = "ESTIMATING";
      // Mock estimation logic
      const estimatedCost = decision.primaryModel.costPer1kInput * (prompt.length / 4000);
      this.checkBudget(estimatedCost);

      if (strategy === "ensemble" && decision.secondaryModel && decision.synthesisModel) {
        run.state = "EXECUTING";
        const [res1, res2] = await Promise.all([
          this.executeModel(decision.primaryModel.id, prompt, run),
          this.executeModel(decision.secondaryModel.id, prompt, run)
        ]);
        
        run.state = "COMPARING";
        if (res1 === res2) {
           run.warnings.push("Models produced identical outputs.");
        }

        run.state = "SYNTHESIZING";
        const synthesisPrompt = `Synthesize these two responses:\n1: ${res1}\n2: ${res2}\nResolve any conflicts.`;
        const finalResult = await this.executeModel(decision.synthesisModel.id, synthesisPrompt, run);
        
        run.result = finalResult;
      } else {
        run.state = "EXECUTING";
        const result = await this.executeModel(decision.primaryModel.id, prompt, run);
        run.result = result;
      }

      run.state = run.warnings.length > 0 ? "COMPLETED_WITH_WARNINGS" : "COMPLETED";
    } catch (error: any) {
      run.state = "FAILED";
      run.warnings.push(error.message);
    }
    
    run.updatedAt = new Date().toISOString();
    return run;
  }

  private async executeModel(modelId: string, prompt: string, run: OrchestrationRun): Promise<string> {
    const model = globalModelRegistry.getModel(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    const provider = this.providers.get(model.provider);
    if (!provider) {
        run.warnings.push(`Provider ${model.provider} not registered. Returning simulated response.`);
        // Fake execution for simulation if no real provider is registered
        const simulatedCost = model.costPer1kInput * 0.1;
        this.currentBudget += simulatedCost;
        run.budgetConsumed = this.currentBudget;
        return `Simulated response from ${model.displayName}`;
    }

    // Cost tracking would happen here dynamically
    const response = await provider.executeRequest({ prompt, modelId });
    // Cost tracking would happen here dynamically using response.usage
    const inputTokens = response.usage?.inputTokens || 0;
    const outputTokens = response.usage?.outputTokens || 0;
    const simulatedCost = (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput;
    this.currentBudget += simulatedCost || 0.001; // fallback
    run.budgetConsumed = this.currentBudget;
    return response.text;
    return result;
  }
}
