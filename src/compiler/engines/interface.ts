import { ParsedIntent, Requirement, EngineDefinition, PromptSection } from "../models/schemas";

export interface IEngineContext {
  intent: ParsedIntent;
  requirements: Requirement[];
  sharedState: Record<string, any>;
}

export interface IEngine {
  readonly definition: EngineDefinition;
  
  /**
   * Evaluates if this engine should run given the context.
   */
  shouldRun(context: IEngineContext): boolean;

  /**
   * Executes the engine's core logic.
   */
  execute(context: IEngineContext): Promise<PromptSection[]>;
}
