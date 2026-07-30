import { RuleDefinition } from "../models/schemas";

export interface IRuleLoader {
  load(): Promise<RuleDefinition[]>;
}

export interface IRuleRegistry {
  register(rule: RuleDefinition): void;
  getRule(id: string): RuleDefinition | undefined;
  getAllRules(): RuleDefinition[];
  getRulesBySection(section: string): RuleDefinition[];
  resolveDependencies(ruleId: string): RuleDefinition[];
}
