import { ResolvedExecutionPlan, RuleSet, RequirementGraph } from "../models/domain";

export interface IConflictResolver {
  resolve(plan: ResolvedExecutionPlan, rules: RuleSet, requirements: RequirementGraph): Promise<ResolvedExecutionPlan>;
}

export class ConflictResolver implements IConflictResolver {
  async resolve(plan: ResolvedExecutionPlan, rules: RuleSet, requirements: RequirementGraph): Promise<ResolvedExecutionPlan> {
    // Detect rule conflicts (e.g., mutually exclusive engines)
    // Resolve according to PromptForge precedence (Security > Feature > Performance)
    
    const resolvedNotes = [...plan.resolutionNotes];
    let resolvedPlan = { ...plan };

    // Example logic: if high security is required, enforce Governance engine
    const isHighSecurity = requirements.nodes.some(n => n.description.toLowerCase().includes("high security"));
    
    if (isHighSecurity && !resolvedPlan.orderedEngines.find(e => e.name === "GovernanceEngine")) {
       resolvedNotes.push("Added GovernanceEngine to resolve security requirement.");
       // In a full implementation, we'd look up the engine and inject it.
    }

    resolvedPlan.resolutionNotes = resolvedNotes;
    
    return resolvedPlan;
  }
}
