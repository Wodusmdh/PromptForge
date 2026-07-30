import { RuleRecord } from "../models/schema";

export interface IRuleCache {
  get(id: string, version: string): RuleRecord | undefined;
  set(rule: RuleRecord): void;
  invalidate(id: string, version: string): void;
  clear(): void;
}

export class MemoryRuleCache implements IRuleCache {
  private cache = new Map<string, RuleRecord>();

  private getKey(id: string, version: string) {
    return `${id}@${version}`;
  }

  get(id: string, version: string): RuleRecord | undefined {
    return this.cache.get(this.getKey(id, version));
  }

  set(rule: RuleRecord): void {
    this.cache.set(this.getKey(rule.id, rule.version), rule);
  }

  invalidate(id: string, version: string): void {
    this.cache.delete(this.getKey(id, version));
  }

  clear(): void {
    this.cache.clear();
  }
}
