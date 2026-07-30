import { CompiledPrompt } from "../models/schemas";
import { ValidationReport } from "../models/domain";
import { RuleSet, ResolvedExecutionPlan } from "../models/domain";

export interface IValidationPipeline {
  validate(prompt: CompiledPrompt, plan: ResolvedExecutionPlan, rules: RuleSet): Promise<ValidationReport>;
}

export class ValidationPipeline implements IValidationPipeline {
  async validate(prompt: CompiledPrompt, plan: ResolvedExecutionPlan, rules: RuleSet): Promise<ValidationReport> {
    const missingRules: string[] = [];
    const missingEngines: string[] = [];
    const conflictingRequirements: string[] = [];
    let contextOverflow = false;
    let invalidOrdering = false;
    const missingMandatorySections: string[] = [];
    const errors: string[] = [];

    // Context overflow check
    if (prompt.estimatedTokens > 32000) {
      contextOverflow = true;
      errors.push("Prompt context exceeds 32k tokens limit.");
    }

    // Rules validation
    rules.mandatory.forEach(rule => {
      if (!prompt.compiledMarkdown.includes(rule.section)) {
        missingRules.push(rule.id);
        errors.push(`Mandatory rule ${rule.id} (Section ${rule.section}) is missing in the final output.`);
      }
    });

    // Check mandatory sections
    const requiredSections = ["Context", "Requirements", "Rules & Constraints"];
    requiredSections.forEach(reqSec => {
      if (!prompt.sections.find(sec => sec.title === reqSec)) {
        missingMandatorySections.push(reqSec);
        errors.push(`Missing mandatory section: ${reqSec}`);
      }
    });

    const isValid = errors.length === 0;

    return {
      isValid,
      missingRules,
      missingEngines,
      conflictingRequirements,
      contextOverflow,
      invalidOrdering,
      missingMandatorySections,
      errors
    };
  }
}
