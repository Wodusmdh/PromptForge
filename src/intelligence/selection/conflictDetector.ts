import { RuleRecord } from "../models/schema";

export class ConflictDetector {
  detectConflicts(rules: RuleRecord[]): string[] {
    const conflicts: string[] = [];
    const ruleIds = new Set(rules.map(r => r.id));

    for (const rule of rules) {
      if (rule.deprecated) {
        conflicts.push(`Rule ${rule.id} is deprecated.`);
      }
      for (const conflictId of rule.conflicts) {
        if (ruleIds.has(conflictId)) {
          conflicts.push(`Rule ${rule.id} conflicts with ${conflictId}.`);
        }
      }
    }

    return conflicts;
  }
}
