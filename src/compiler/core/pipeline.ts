import { RequestParser } from "./parser";
import { EngineRegistry } from "../engines/registry";
import { RuleRegistry } from "../rules/registry";
import { IEngineContext } from "../engines/interface";
import { UserRequest, ExecutionPlan } from "../models/schemas";
import { randomUUID } from "crypto";
import { PipelineError } from "./errors";

export class CompilerPipeline {
  constructor(
    private engineRegistry: EngineRegistry,
    private ruleRegistry: RuleRegistry
  ) {}

  async createExecutionPlan(rawInput: unknown): Promise<{ request: UserRequest, plan: ExecutionPlan, context: IEngineContext }> {
    // 1. Request Input -> Request Parser
    const request = RequestParser.parseInput(rawInput);

    // 2. Request Parser -> Intent Object
    const intent = await RequestParser.extractIntent(request);

    // 3. Extract Requirements (Stub for Phase 1)
    const context: IEngineContext = {
      intent,
      requirements: [],
      sharedState: {}
    };

    // 4. Select Engines & Build Plan
    const allEngines = this.engineRegistry.getAllEngines();
    const activeEngines = allEngines.filter(e => e.shouldRun(context)).map(e => e.definition.id);
    
    if (activeEngines.length === 0) {
      throw new PipelineError("No engines selected for execution.");
    }

    const stages = this.engineRegistry.resolveExecutionPlan(activeEngines);
    
    const plan: ExecutionPlan = {
      id: randomUUID(),
      stages,
      status: "Pending"
    };

    return { request, plan, context };
  }

  // Future phase: executePlan(plan, context)
}
