import { RequestContext, RequirementGraph } from "../models/domain";
import { PromptGraph } from "./promptGraph";
import { PromptQualityReport } from "./promptAnalyzer";
import { KnowledgeEngineResult } from "./knowledgeEngine";

export type SeverityLevel = "Info" | "Low" | "Medium" | "High" | "Critical";

export interface ValidationIssue {
  id: string;
  type: string;
  severity: SeverityLevel;
  problem: string;
  reason: string;
  evidence: string;
  suggestedFix: string;
  priority: number;
}

export interface ValidationCheck {
  ruleName: string;
  status: "Passed" | "Failed";
  severity?: SeverityLevel;
  reason: string;
  evidence: string;
  recommendation?: string;
}

export interface ValidationReport {
  validationScore: number;
  overallStatus: "Pass" | "Fail" | "Warning";
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
  passedChecks: ValidationCheck[];
  failedChecks: ValidationCheck[];
  summary: string;
}

export class PromptValidationEngine {
  public validate(
    context: RequestContext,
    reqs: RequirementGraph,
    graph: PromptGraph,
    quality: PromptQualityReport,
    knowledge: KnowledgeEngineResult
  ): ValidationReport {
    const passedChecks: ValidationCheck[] = [];
    const failedChecks: ValidationCheck[] = [];
    const allIssues: ValidationIssue[] = [];

    let score = 100;
    let conflictCount = reqs.metrics?.conflictCount || 0;
    
    // Evaluate missing/existing parts from Graph and Quality
    const checkRule = (
      ruleName: string,
      passed: boolean,
      failSeverity: SeverityLevel,
      problem: string,
      reason: string,
      evidence: string,
      suggestedFix: string,
      penalty: number
    ) => {
      if (passed) {
        passedChecks.push({
          ruleName,
          status: "Passed",
          reason: `${ruleName} found.`,
          evidence
        });
      } else {
        failedChecks.push({
          ruleName,
          status: "Failed",
          severity: failSeverity,
          reason,
          evidence,
          recommendation: suggestedFix
        });
        allIssues.push({
          id: ruleName.replace(/\s+/g, '_').toLowerCase(),
          type: ruleName,
          severity: failSeverity,
          problem,
          reason,
          evidence,
          suggestedFix,
          priority: penalty
        });
        score -= penalty;
      }
    };

    // 1. Objective Exists
    const hasObjective = quality.missingComponents.indexOf("Objective") === -1;
    checkRule(
      "Missing Objective",
      hasObjective,
      "Critical",
      "Weak Objective",
      "Objective is missing or unclear.",
      context.rawInput || "Empty",
      "Specify a clear action verb.",
      20
    );

    // 2. Audience Exists
    const hasAudience = quality.missingComponents.indexOf("Audience") === -1;
    checkRule(
      "Missing Audience",
      hasAudience,
      "Medium",
      "Audience is missing",
      "No audience specified.",
      "No audience keyword.",
      "Specify the target audience.",
      10
    );

    // 3. Context Exists
    const hasContext = quality.missingComponents.indexOf("Context") === -1;
    checkRule(
      "Missing Context",
      hasContext,
      "Medium",
      "Context is missing",
      "Context length is too short.",
      "Length <= 50",
      "Provide more context.",
      10
    );

    // 4. Output Format
    const hasOutput = quality.missingComponents.indexOf("Output Format") === -1;
    checkRule(
      "Undefined Output Format",
      hasOutput,
      "High",
      "Output format is not defined.",
      "No output format keywords.",
      "No format detected.",
      "Define the expected output format.",
      15
    );

    // 5. Tone Definition
    const hasTone = quality.missingComponents.indexOf("Tone") === -1;
    checkRule(
      "Missing Tone",
      hasTone,
      "Low",
      "Tone is missing.",
      "No tone specified.",
      "No tone keywords.",
      "Specify a tone.",
      5
    );

    // 6. Conflicting Instructions
    checkRule(
      "Conflicting Constraints",
      conflictCount === 0,
      "Critical",
      "Conflicting instructions detected.",
      "Multiple conflicting requirements.",
      `${conflictCount} conflicts found.`,
      "Resolve conflicting requirements.",
      20
    );

    // 7. Duplicate Constraints
    const duplicateConstraints = graph.findDuplicatedConstraints();
    checkRule(
      "Duplicate Requirements",
      duplicateConstraints.length === 0,
      "Low",
      "Duplicate requirements detected.",
      "Same requirement multiple times.",
      `${duplicateConstraints.length} duplicates.`,
      "Remove duplicate constraints.",
      5
    );

    // 8. Unsupported Assumptions
    const unsupportedAssumptions = graph.findUnsupportedAssumptions();
    checkRule(
      "Unsupported Assumptions",
      unsupportedAssumptions.length === 0,
      "Medium",
      "Unsupported assumptions detected.",
      "Assumptions without complete status.",
      `${unsupportedAssumptions.length} unsupported.`,
      "Clarify or verify assumptions.",
      10
    );

    // 9. Ambiguous wording
    checkRule(
      "Ambiguous Language",
      quality.ambiguities.length === 0,
      "Medium",
      "Ambiguous language detected.",
      "Vague wording used.",
      quality.ambiguities.join(", ") || "None",
      "Use precise language.",
      10
    );

    // 10. Missing critical info
    checkRule(
      "Missing Information",
      quality.missingComponents.indexOf("Constraints") === -1,
      "High",
      "Missing Success Criteria",
      "No explicit constraints or criteria.",
      "No explicit requirements.",
      "Add success criteria or constraints.",
      15
    );
    
    // 11. Hallucination Risk
    checkRule(
      "Hallucination Risk",
      quality.hallucinationRisk.score >= 50,
      "High",
      "High hallucination risk.",
      quality.hallucinationRisk.reason,
      quality.hallucinationRisk.evidence,
      "Provide more context and constraints to lower hallucination risk.",
      15
    );

    // Score cap
    score = Math.max(0, score);
    if (!context.rawInput || context.rawInput.trim() === "") { score = 0; }
    
    // Categorize
    const issues = allIssues.filter(i => i.severity === "High" || i.severity === "Critical");
    const warnings = allIssues.filter(i => i.severity === "Medium");
    const suggestions = allIssues.filter(i => i.severity === "Low" || i.severity === "Info");

    let overallStatus: "Pass" | "Fail" | "Warning" = "Pass";
    if (score < 50 || issues.length > 0) overallStatus = "Fail";
    else if (score < 80 || warnings.length > 0) overallStatus = "Warning";

    const summary = `${passedChecks.length} checks passed, ${failedChecks.length} checks failed. Score: ${score}.`;

    return {
      validationScore: score,
      overallStatus,
      issues,
      warnings,
      suggestions,
      passedChecks,
      failedChecks,
      summary
    };
  }
}
