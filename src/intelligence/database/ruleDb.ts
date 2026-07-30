import { RuleRecord } from "../models/schema";
import { IRuleCache } from "../cache/ruleCache";

export class RuleDatabase {
  private rules: Map<string, RuleRecord[]> = new Map(); // id -> versions[]

  constructor(private cache: IRuleCache) {}

  insert(rule: RuleRecord): void {
    const versions = this.rules.get(rule.id) || [];
    const existingIndex = versions.findIndex(r => r.version === rule.version);
    if (existingIndex >= 0) {
      versions[existingIndex] = rule;
    } else {
      versions.push(rule);
    }
    // Sort versions descending
    versions.sort((a, b) => b.version.localeCompare(a.version));
    this.rules.set(rule.id, versions);
    this.cache.set(rule);
  }

  get(id: string, version?: string): RuleRecord | undefined {
    if (version) {
      const cached = this.cache.get(id, version);
      if (cached) return cached;
      
      const versions = this.rules.get(id) || [];
      const found = versions.find(r => r.version === version);
      if (found) this.cache.set(found);
      return found;
    }
    
    // Get latest if no version specified
    const versions = this.rules.get(id) || [];
    if (versions.length > 0) {
      const latest = versions[0];
      this.cache.set(latest);
      return latest;
    }
    return undefined;
  }

  getAllLatest(): RuleRecord[] {
    const latestRules: RuleRecord[] = [];
    for (const versions of this.rules.values()) {
      if (versions.length > 0) latestRules.push(versions[0]);
    }
    return latestRules.filter(r => !r.deprecated);
  }
}
