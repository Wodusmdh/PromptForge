import { RuleDefinition } from "../models/schemas";
import { IRuleLoader, IRuleRegistry } from "./types";

export class StaticRuleLoader implements IRuleLoader {
  async load(): Promise<RuleDefinition[]> {
    // In a real implementation, this would parse PROMPTFORGE_SYSTEM_SPECIFICATION.md
    return [
      {
        id: "rule-1",
        section: "39.3",
        content: "High-risk operations must require explicit human approval.",
        enforcementLevel: "Strict",
        dependencies: [],
      },
      {
        id: "rule-2",
        section: "39.6",
        content: "Destructive operations must strictly enforce the authorization requirements of Section 39.3.",
        enforcementLevel: "Strict",
        dependencies: ["rule-1"],
      }
    ];
  }
}
