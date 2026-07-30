import sys

with open('src/api/controllers/promptController.ts', 'r') as f:
    content = f.read()

replacement = """import { Request, Response } from "express";
import { createCompiler } from "../../compiler/di";
import { UserRequest, UserRequestSchema } from "../../compiler/models/schemas";

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
         // Some other unsupported value? Let's map to generic.
         // Actually, if it's explicitly not empty and not in the list, schema says enum.
         // Let's use generic as fallback but we should check if they passed something fully invalid.
         // Wait, the prompt says "Either reject... or use existing generic target only if explicitly justified. Unknown values must NOT silently become a misleading provider."
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

  optimize(req: Request, res: Response) {
    res.status(200).json({
      originalTokens: 100,
      optimizedTokens: 80,
      optimizedMarkdown: "## Requirements\\nBuild great app.",
      diff: { removed: ["a"], added: [] }
    });
  }

  analyze(req: Request, res: Response) {
    res.status(200).json({
      qualityScore: 92,
      completeness: 90,
      readability: 95
    });
  }

  validate(req: Request, res: Response) {
    res.status(200).json({
      isValid: true,
      errors: [],
      warnings: []
    });
  }
}
"""

with open('src/api/controllers/promptController.ts', 'w') as f:
    f.write(replacement)
