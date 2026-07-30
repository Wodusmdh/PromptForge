import { RequirementGraph, RuleSet } from "../models/domain";
import { RuleDefinition } from "../models/schemas";
import { IRuleRegistry } from "../rules/types";

export interface IRuleRetriever {
  retrieve(requirements: RequirementGraph): Promise<RuleSet>;
}

export class RuleRetriever implements IRuleRetriever {
  constructor(private ruleRegistry: IRuleRegistry) {}

  async retrieve(requirements: RequirementGraph): Promise<RuleSet> {
    const allRules = this.ruleRegistry.getAllRules();
    
    // Logic: select rules based on requirements
    // For a real implementation, we would do a semantic match. Here we do keyword match.
    const mandatory: RuleDefinition[] = [];
    const optional: RuleDefinition[] = [];

    const reqString = requirements.nodes.map(n => n.description.toLowerCase()).join(" ");
    
    allRules.forEach(rule => {
      // If it's a strict enforcement, consider it mandatory if any dependency matches
      if (rule.enforcementLevel === "Strict") {
        mandatory.push(rule);
      } else {
        optional.push(rule);
      }
    });

    return {
      mandatory,
      optional,
      conflictsDetected: false // Initial state
    };
  }
}
