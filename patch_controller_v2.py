import sys

with open('src/api/controllers/promptController.ts', 'r') as f:
    content = f.read()

replacement = """import { Request, Response } from "express";
import { createCompiler } from "../../compiler/di";
import { UserRequest, UserRequestSchema, CompiledPrompt } from "../../compiler/models/schemas";
import { ResolvedExecutionPlan, RuleSet } from "../../compiler/models/domain";
import { PromptCompressor } from "../../optimization/compressor/compressor";
import { ContextOptimizer } from "../../optimization/core/contextOptimizer";
import { PromptQualityAnalyzer } from "../../optimization/analyzer/qualityAnalyzer";
import { SemanticPreservationVerifier } from "../../optimization/preservation/semanticPreservation";
import { PromptDiffGenerator } from "../../optimization/diff/promptDiff";
import { PromptOptimizer } from "../../optimization/core/optimizer";
import { ValidationPipeline } from "../../compiler/core/validationPipeline";

// In-memory store for development/testing
const currentSession: {
  prompt: CompiledPrompt | null;
  plan: ResolvedExecutionPlan | null;
  rules: RuleSet | null;
} = { prompt: null, plan: null, rules: null };

export class PromptController {
  async compile(req: Request, res: Response) {
    try {
      const { idea, targetAssistant, ...rest } = req.body;

      if (!idea || typeof idea !== 'string') {
        return res.status(400).json({
          status: "error",
          code: "VALIDATION_ERROR",
          error: "Idea is required and must be a string."
        });
      }

      // Normalize targetAssistant
      let normalizedAssistant = "generic";
      const ta = (targetAssistant || "").toLowerCase();
      if (ta === "gemini" || ta === "gemini-ai-studio") {
        normalizedAssistant = "gemini-ai-studio";
      } else if (ta === "claude" || ta === "cursor-claude") {
        normalizedAssistant = "cursor-claude";
      } else if (ta === "bolt" || ta === "v0" || ta === "bolt-v0") {
        normalizedAssistant = "bolt-v0";
      } else if (ta === "windsurf") {
        normalizedAssistant = "windsurf";
      } else if (ta) {
         if (ta === "generic") {
           normalizedAssistant = "generic";
         } else {
           return res.status(400).json({
             status: "error",
             code: "VALIDATION_ERROR",
             error: `Unsupported targetAssistant: ${ta}`
           });
         }
      }

      const requestPayload = {
        idea,
        targetAssistant: normalizedAssistant,
        complexity: rest.complexity || "Medium",
        stack: rest.stack || "React 19 + Express + Tailwind CSS v4",
        architectureStyle: rest.architectureStyle || "Modular Monolith",
        uiStyle: rest.uiStyle || "Modern Minimalist",
        dbType: rest.dbType || "PostgreSQL",
        securityLevel: rest.securityLevel || "Standard",
        additionalRules: rest.additionalRules || "",
      };

      const parsedRequest = UserRequestSchema.parse(requestPayload);

      const compiler = createCompiler();
      const compilerOutput = await compiler.compile(parsedRequest);

      // Store current compilation for optimize/analyze/validate
      currentSession.prompt = compilerOutput.compiledPrompt;
      currentSession.rules = { mandatory: compilerOutput.selectedRules, optional: [], conflictsDetected: false }; 
      currentSession.plan = { planId: "1", orderedEngines: compilerOutput.selectedEngines, resolutionNotes: [] };

      return res.status(200).json({
        id: compilerOutput.compiledPrompt.id,
        status: "success",
        compiledPrompt: compilerOutput.compiledPrompt,
        executionSummary: compilerOutput.executionSummary,
        selectedRules: compilerOutput.selectedRules,
        selectedEngines: compilerOutput.selectedEngines,
        validationResult: compilerOutput.validationResult
      });

    } catch (e: any) {
      if (e.name === 'ZodError') {
        return res.status(400).json({
          status: "error",
          code: "VALIDATION_ERROR",
          error: "Invalid request payload format."
        });
      }
      return res.status(500).json({
        status: "error",
        code: "COMPILER_ERROR",
        error: "An unexpected error occurred during compilation."
      });
    }
  }

  async optimize(req: Request, res: Response) {
    try {
      let promptToOptimize = currentSession.prompt;
      if (req.body.compiledPrompt) promptToOptimize = req.body.compiledPrompt;

      if (!promptToOptimize) {
         return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", error: "No compiled prompt provided." });
      }

      const compressor = new PromptCompressor();
      const contextOptimizer = new ContextOptimizer();
      const qualityAnalyzer = new PromptQualityAnalyzer();
      const verifier = new SemanticPreservationVerifier();
      const diffGenerator = new PromptDiffGenerator();
      const optimizer = new PromptOptimizer(compressor, contextOptimizer, qualityAnalyzer, verifier, diffGenerator);

      const result = optimizer.optimize(promptToOptimize);

      return res.status(200).json({
        status: "success",
        originalTokens: result.metrics.originalTokens,
        optimizedTokens: result.metrics.optimizedTokens,
        optimizedMarkdown: result.optimized.compiledMarkdown,
        diff: result.diff
      });
    } catch (e: any) {
       return res.status(500).json({ status: "error", code: "OPTIMIZATION_ERROR", error: e.message || "Failed to optimize." });
    }
  }

  async analyze(req: Request, res: Response) {
    try {
      let promptToAnalyze = currentSession.prompt;
      if (req.body.compiledPrompt) promptToAnalyze = req.body.compiledPrompt;

      if (!promptToAnalyze) {
         return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", error: "No compiled prompt provided." });
      }

      const qualityAnalyzer = new PromptQualityAnalyzer();
      const result = qualityAnalyzer.analyze(promptToAnalyze);

      return res.status(200).json({
        status: "success",
        qualityScore: result.overall,
        completeness: result.completeness,
        readability: result.readability,
        consistency: result.consistency,
        efficiency: result.efficiency
      });
    } catch (e: any) {
       return res.status(500).json({ status: "error", code: "ANALYSIS_ERROR", error: e.message || "Failed to analyze." });
    }
  }

  async validate(req: Request, res: Response) {
    try {
      let promptToValidate = currentSession.prompt;
      let planToValidate = currentSession.plan;
      let rulesToValidate = currentSession.rules;

      if (req.body.compiledPrompt) promptToValidate = req.body.compiledPrompt;
      if (req.body.plan) planToValidate = req.body.plan;
      if (req.body.rules) rulesToValidate = req.body.rules;

      if (!promptToValidate || !planToValidate || !rulesToValidate) {
         return res.status(400).json({ status: "error", code: "VALIDATION_ERROR", error: "No compiled prompt, plan, or rules provided." });
      }

      const pipeline = new ValidationPipeline();
      const report = await pipeline.validate(promptToValidate, planToValidate, rulesToValidate);

      return res.status(200).json({
        status: "success",
        isValid: report.isValid,
        errors: report.errors,
        warnings: [
          ...report.missingRules.map(r => `Missing rule: ${r}`),
          ...(report.contextOverflow ? ["Context overflow detected"] : [])
        ]
      });
    } catch (e: any) {
       return res.status(500).json({ status: "error", code: "VALIDATION_PIPELINE_ERROR", error: e.message || "Failed to validate." });
    }
  }
}
"""

with open('src/api/controllers/promptController.ts', 'w') as f:
    f.write(replacement)
