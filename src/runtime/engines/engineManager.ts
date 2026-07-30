import { IRuntimeEngine } from "../models/types";
import { EngineDefinition } from "../../compiler/models/schemas";

export interface IEngineManager {
  registerEngine(engine: IRuntimeEngine): void;
  getEngine(engineId: string): IRuntimeEngine | undefined;
  loadRequiredEngines(definitions: EngineDefinition[]): IRuntimeEngine[];
}

export class EngineManager implements IEngineManager {
  private engines: Map<string, IRuntimeEngine> = new Map();

  registerEngine(engine: IRuntimeEngine): void {
    this.engines.set(engine.definition.id, engine);
  }

  getEngine(engineId: string): IRuntimeEngine | undefined {
    return this.engines.get(engineId);
  }

  loadRequiredEngines(definitions: EngineDefinition[]): IRuntimeEngine[] {
    const loaded: IRuntimeEngine[] = [];
    for (const def of definitions) {
      const engine = this.getEngine(def.id);
      if (engine) {
        loaded.push(engine);
      } else {
        throw new Error(`Required engine ${def.id} is not registered in EngineManager.`);
      }
    }
    return loaded;
  }
}
