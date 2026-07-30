import { RuleRecord, RuleSelectionContext, SelectionResult, SelectedRule } from "../models/schema";
import { RuleDatabase } from "../database/ruleDb";

export class RuleSelector {
  constructor(private db: RuleDatabase) {}

  select(context: RuleSelectionContext): SelectionResult {
    const allRules = this.db.getAllLatest();
    
    const mandatory: SelectedRule[] = [];
    const optional: SelectedRule[] = [];
    const ignored: SelectedRule[] = [];

    for (const rule of allRules) {
      let isMandatory = false;
      let isOptional = false;
      let reason = "Did not match context.";

      // Mandatory match logic
      if (rule.requestTypes.includes(context.requestType) || rule.tags.some(t => context.tags.includes(t))) {
        if (rule.priority === "High") {
          isMandatory = true;
          reason = `Matched request type/tag with High priority.`;
        } else {
          isOptional = true;
          reason = `Matched request type/tag with ${rule.priority} priority.`;
        }
      } else if (rule.requiredEngines.some(e => context.engines.includes(e))) {
        isOptional = true;
        reason = `Matched required engine.`;
      }

      if (isMandatory) {
        mandatory.push({ rule, reason });
      } else if (isOptional) {
        optional.push({ rule, reason });
      } else {
        ignored.push({ rule, reason });
      }
    }

    return { mandatory, optional, ignored };
  }
}
