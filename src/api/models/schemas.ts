import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { PromptForgeError } from "./errors";
import { CompiledPromptSchema, ExecutionPlanSchema, RuleDefinitionSchema } from "../../compiler/models/schemas";

const CompileRequestSchema = z.object({
  idea: z.string().min(1, "The request body must include a string 'idea'."),
  targetAssistant: z.string().min(1, "Missing or invalid 'targetAssistant'."),
  complexity: z.string().optional(),
  stack: z.string().optional(),
  architectureStyle: z.string().optional(),
  uiStyle: z.string().optional(),
  dbType: z.string().optional(),
  securityLevel: z.string().optional(),
  additionalRules: z.string().optional(),
});

const SessionOrPromptRequestSchema = z.object({
  sessionId: z.string().optional(),
  compiledPrompt: CompiledPromptSchema.optional(),
}).refine(data => data.sessionId || data.compiledPrompt, {
  message: "Either sessionId or compiledPrompt must be provided"
});

const ValidateRequestSchema = z.object({
  sessionId: z.string().optional(),
  compiledPrompt: CompiledPromptSchema.optional(),
  plan: ExecutionPlanSchema.optional(),
  rules: z.object({
    mandatory: z.array(RuleDefinitionSchema),
    optional: z.array(RuleDefinitionSchema),
    conflictsDetected: z.boolean()
  }).optional(),
}).refine(data => data.sessionId || (data.compiledPrompt && data.plan && data.rules), {
  message: "Either sessionId or all of (compiledPrompt, plan, rules) must be provided"
});

export function validateCompileRequest(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = CompileRequestSchema.parse(req.body);
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      next(new PromptForgeError(400, "VALIDATION_ERROR", "Invalid request payload format.", err.message));
    } else {
      next(err);
    }
  }
}

export function validateSessionOrPromptRequest(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = SessionOrPromptRequestSchema.parse(req.body);
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      next(new PromptForgeError(400, "VALIDATION_ERROR", "Invalid request payload format.", err.message));
    } else {
      next(err);
    }
  }
}

export function validateValidateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = ValidateRequestSchema.parse(req.body);
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      next(new PromptForgeError(400, "VALIDATION_ERROR", "Invalid request payload format.", err.message));
    } else {
      next(err);
    }
  }
}
