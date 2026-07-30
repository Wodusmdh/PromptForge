import { IEngine } from "./interface";
import { EngineError } from "../core/errors";
import { EngineDefinition } from "../models/schemas";

export class EngineRegistry {
  private engines: Map<string, IEngine> = new Map();

  register(engine: IEngine): void {
    if (this.engines.has(engine.definition.id)) {
      throw new EngineError(`Engine ${engine.definition.id} is already registered.`);
    }
    this.engines.set(engine.definition.id, engine);
  }

  getEngine(id: string): IEngine | undefined {
    return this.engines.get(id);
  }

  getAllEngines(): IEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Sorts engines topologically based on dependencies.
   */
  resolveExecutionPlan(activeEngineIds: string[]): EngineDefinition[][] {
    // Simple mock topology for now
    // In production, implement a full DAG topological sort.
    const plan: EngineDefinition[][] = [];
    const active = activeEngineIds.map(id => this.getEngine(id)).filter(e => e !== undefined) as IEngine[];
    
    // Group all without dependencies first
    const stage1 = active.filter(e => e.definition.dependencies.length === 0).map(e => e.definition);
    if (stage1.length > 0) plan.push(stage1);

    // Group all with dependencies second (naive implementation)
    const stage2 = active.filter(e => e.definition.dependencies.length > 0).map(e => e.definition);
    if (stage2.length > 0) plan.push(stage2);

    return plan;
  }
}
