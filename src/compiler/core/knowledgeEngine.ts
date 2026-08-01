import { RequestContext, RequirementGraph } from "../models/domain";

export type RuleCategory = "Clarity" | "Completeness" | "Constraints" | "Output" | "Examples" | "Context" | "Audience" | "Tone" | "Safety" | "Coding" | "Writing" | "Translation" | "Image" | "Research" | "Business" | "Education" | "General";

export type RuleSeverity = "Low" | "Medium" | "High" | "Critical";

export interface KnowledgeRule {
  id: string;
  category: RuleCategory;
  severity: RuleSeverity;
  description: string;
  condition: (context: RequestContext, reqs?: RequirementGraph) => boolean; // returns true if rule is VIOLATED or matches a specific state (e.g. true = "missing objective")
  recommendation: string;
  scoreImpact: number;
  tags: string[];
  example?: string;
}

export interface MatchedRule {
  id: string;
  reason: string;
  evidence: string;
  severity: RuleSeverity;
  recommendation: string;
  scoreImpact: number;
}

export interface KnowledgeEngineResult {
  matchedRules: MatchedRule[];
  failedRules: KnowledgeRule[];
  ruleCount: number;
  knowledgeVersion: string;
  ruleCategories: RuleCategory[];
}

export class PromptKnowledgeEngine {
  private rules: KnowledgeRule[] = [];
  public readonly knowledgeVersion = "1.0.0";
  
  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      {
        id: "objective_required",
        category: "Clarity",
        severity: "High",
        description: "Objective missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          const actionVerbs = ["build", "write", "explain", "translate", "create", "generate"];
          return !actionVerbs.some(v => text.includes(v));
        },
        recommendation: "Specify the primary task using an action verb.",
        scoreImpact: -20,
        tags: ["objective", "clarity", "action"],
        example: "e.g. 'Build a React app'"
      },
      {
        id: "audience_required",
        category: "Completeness",
        severity: "Medium",
        description: "Audience missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          return !(text.includes("beginner") || text.includes("expert") || text.includes("audience"));
        },
        recommendation: "Specify who the output is intended for.",
        scoreImpact: -15,
        tags: ["audience"]
      },
      {
        id: "output_format_required",
        category: "Output",
        severity: "Medium",
        description: "Output format missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          return !(text.includes("format") || text.includes("json") || text.includes("markdown") || text.includes("website") || text.includes("app") || text.includes("story") || text.includes("japanese"));
        },
        recommendation: "Define the expected output format.",
        scoreImpact: -15,
        tags: ["output", "format"]
      },
      {
        id: "constraints_recommended",
        category: "Constraints",
        severity: "Low",
        description: "Constraints missing",
        condition: (ctx, reqs) => {
           if (reqs && reqs.nodes.some(n => n.type === "constraint" || n.category === "Explicit")) {
             return false;
           }
           const text = ctx.normalizedText || "";
           return !(text.includes("must") || text.includes("no") || text.includes("only") || text.includes("constraint") || text.includes("rule"));
        },
        recommendation: "Provide constraints to narrow down the scope.",
        scoreImpact: -10,
        tags: ["constraint"]
      },
      {
        id: "examples_missing",
        category: "Examples",
        severity: "Low",
        description: "Examples missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          return !(text.includes("example") || text.includes("e.g."));
        },
        recommendation: "Provide examples to clarify the request.",
        scoreImpact: -10,
        tags: ["example"]
      },
      {
        id: "coding_guidelines",
        category: "Coding",
        severity: "Medium",
        description: "Coding stack missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          const isCoding = text.includes("build") || text.includes("code") || text.includes("api") || text.includes("app") || text.includes("react");
          const hasStack = text.includes("react") || text.includes("node") || text.includes("python");
          return isCoding && !hasStack;
        },
        recommendation: "Specify a technology stack for your coding task.",
        scoreImpact: -10,
        tags: ["coding", "stack"]
      },
      {
        id: "writing_guidelines",
        category: "Writing",
        severity: "Low",
        description: "Writing tone missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          const isWriting = text.includes("write") || text.includes("story") || text.includes("essay");
          const hasTone = text.includes("tone") || text.includes("style") || text.includes("horror");
          return isWriting && !hasTone;
        },
        recommendation: "Specify a tone for your writing task.",
        scoreImpact: -10,
        tags: ["writing", "tone"]
      },
      {
        id: "translation_guidelines",
        category: "Translation",
        severity: "High",
        description: "Translation language missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          const isTranslation = text.includes("translate");
          const hasLanguage = text.includes("japanese") || text.includes("english") || text.includes("spanish") || text.includes("french");
          return isTranslation && !hasLanguage;
        },
        recommendation: "Specify the target language for translation.",
        scoreImpact: -20,
        tags: ["translation", "language"]
      },
      {
        id: "business_guidelines",
        category: "Business",
        severity: "Medium",
        description: "Business target missing",
        condition: (ctx) => {
          const text = ctx.normalizedText || "";
          const isBusiness = text.includes("business") || text.includes("marketing") || text.includes("sales");
          const hasTarget = text.includes("target") || text.includes("customer") || text.includes("market");
          return isBusiness && !hasTarget;
        },
        recommendation: "Specify the target market or customer for business tasks.",
        scoreImpact: -15,
        tags: ["business"]
      }
    ];
  }

  public registerRule(rule: KnowledgeRule) {
    if (!this.rules.find(r => r.id === rule.id)) {
      this.rules.push(rule);
    }
  }
  
  public getRules() {
    return this.rules;
  }

  public evaluate(context: RequestContext, reqs?: RequirementGraph): KnowledgeEngineResult {
    const matchedRules: MatchedRule[] = [];
    const failedRules: KnowledgeRule[] = [];

    const ruleCategories: RuleCategory[] = [
      "Clarity", "Completeness", "Constraints", "Output", "Examples", 
      "Context", "Audience", "Tone", "Safety", "Coding", "Writing", 
      "Translation", "Image", "Research", "Business", "Education", "General"
    ];

    for (const rule of this.rules) {
      if (rule.condition(context, reqs)) {
        matchedRules.push({
          id: rule.id,
          reason: rule.description,
          evidence: context.rawInput || context.normalizedText || "Context",
          severity: rule.severity,
          recommendation: rule.recommendation,
          scoreImpact: rule.scoreImpact
        });
      } else {
        failedRules.push(rule);
      }
    }

    return {
      matchedRules,
      failedRules,
      ruleCount: this.rules.length,
      knowledgeVersion: this.knowledgeVersion,
      ruleCategories
    };
  }
}
