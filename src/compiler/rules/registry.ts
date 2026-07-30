import { RuleDefinition } from "../models/schemas";
import { IRuleRegistry } from "./types";

export class RuleRegistry implements IRuleRegistry {
  private rules: Map<string, RuleDefinition> = new Map();

  register(rule: RuleDefinition): void {
    if (this.rules.has(rule.id)) {
      throw new Error(`Rule with id ${rule.id} is already registered`);
    }
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): RuleDefinition | undefined {
    return this.rules.get(id);
  }

  getAllRules(): RuleDefinition[] {
    return Array.from(this.rules.values());
  }

  getRulesBySection(section: string): RuleDefinition[] {
    return this.getAllRules().filter((r) => r.section === section);
  }

  resolveDependencies(ruleId: string): RuleDefinition[] {
    const rule = this.getRule(ruleId);
    if (!rule) return [];

    const resolved: RuleDefinition[] = [];
    for (const depId of rule.dependencies) {
      const dep = this.getRule(depId);
      if (dep) {
        resolved.push(dep);
        // recursively resolve if needed, but keeping it simple for now
      }
    }
    return resolved;
  }
}
