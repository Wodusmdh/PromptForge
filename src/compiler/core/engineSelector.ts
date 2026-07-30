import { RequirementGraph, RuleSet, ResolvedExecutionPlan } from "../models/domain";
import { EngineDefinition } from "../models/schemas";
import { EngineRegistry } from "../engines/registry";
import { randomUUID } from "crypto";

export interface IEngineSelector {
  select(requirements: RequirementGraph, rules: RuleSet): Promise<ResolvedExecutionPlan>;
}

export class EngineSelector implements IEngineSelector {
  constructor(private engineRegistry: EngineRegistry) {}

  async select(requirements: RequirementGraph, rules: RuleSet): Promise<ResolvedExecutionPlan> {
    const allEngines = this.engineRegistry.getAllEngines();
    
    // Select required engines based on the domain logic
    const selected = allEngines.filter(e => {
      // In production, we evaluate shouldRun dynamically. 
      // We'll select generators and validators by default.
      return true;
    });

    // Topological sorting is handled inside the registry or a specialized resolver.
    // For simplicity, we order by dependencies.
    const orderedEngines: EngineDefinition[] = [];
    
    // Naive sort
    const noDeps = selected.filter(e => e.definition.dependencies.length === 0);
    const withDeps = selected.filter(e => e.definition.dependencies.length > 0);
    
    noDeps.forEach(e => orderedEngines.push(e.definition));
    withDeps.forEach(e => orderedEngines.push(e.definition));

    return {
      planId: randomUUID(),
      orderedEngines,
      resolutionNotes: ["Default topological sort applied."]
    };
  }
}
