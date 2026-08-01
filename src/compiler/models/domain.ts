import { z } from "zod";
import { EngineDefinitionSchema, RuleDefinitionSchema, PromptSectionSchema, CompiledPromptSchema } from "./schemas";

export const RequestContextSchema = z.object({
  rawInput: z.string(),
  normalizedText: z.string(),
  language: z.string(),
  category: z.string(),
  explicitRequirements: z.array(z.string()),
  implicitRequirements: z.array(z.string()),
  ambiguities: z.array(z.string())
});
export type RequestContext = z.infer<typeof RequestContextSchema>;

export const IntentNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["primary", "secondary"]),
  intent: z.enum(["Coding", "Writing", "Translation", "Summarization", "Research", "Education", "Business", "Marketing", "Analysis", "Image Generation", "Video Generation", "Roleplay", "Mathematics", "General", "Unknown"]).optional(),
  description: z.string(),
  confidence: z.number().min(0).max(1)
});
export type IntentNode = z.infer<typeof IntentNodeSchema>;

export const IntentGraphSchema = z.object({
  primary: IntentNodeSchema,
  secondary: z.array(IntentNodeSchema),
  complexityEstimation: z.number().min(1).max(10)
});
export type IntentGraph = z.infer<typeof IntentGraphSchema>;

export const ReqNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["functional", "non-functional", "constraint", "assumption", "missing"]),
  description: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  dependencies: z.array(z.string()),
  category: z.enum(["Explicit", "Implicit", "Optional", "Rejected"]).optional(),
  confidence: z.number().optional(),
  source: z.string().optional(),
  reason: z.string().optional(),
  text: z.string().optional(),
  status: z.enum(["accepted", "needs user clarification", "rejected"]).optional(),
  duplicateCount: z.number().optional()
});
export type ReqNode = z.infer<typeof ReqNodeSchema>;

export const RequirementGraphSchema = z.object({
  nodes: z.array(ReqNodeSchema),
  edges: z.array(z.object({ from: z.string(), to: z.string() })),
  metrics: z.object({
    requirementCoverage: z.number(),
    conflictCount: z.number(),
    duplicateCount: z.number(),
    rejectedCount: z.number(),
    acceptedCount: z.number(),
    missingCriticalCount: z.number()
  }).optional()
});
export type RequirementGraph = z.infer<typeof RequirementGraphSchema>;

export const RuleSetSchema = z.object({
  mandatory: z.array(RuleDefinitionSchema),
  optional: z.array(RuleDefinitionSchema),
  conflictsDetected: z.boolean()
});
export type RuleSet = z.infer<typeof RuleSetSchema>;

export const ResolvedExecutionPlanSchema = z.object({
  planId: z.string(),
  orderedEngines: z.array(EngineDefinitionSchema),
  resolutionNotes: z.array(z.string())
});
export type ResolvedExecutionPlan = z.infer<typeof ResolvedExecutionPlanSchema>;

export const ValidationReportSchema = z.object({
  isValid: z.boolean(),
  missingRules: z.array(z.string()),
  missingEngines: z.array(z.string()),
  conflictingRequirements: z.array(z.string()),
  contextOverflow: z.boolean(),
  invalidOrdering: z.boolean(),
  missingMandatorySections: z.array(z.string()),
  errors: z.array(z.string())
});
export type ValidationReport = z.infer<typeof ValidationReportSchema>;

export const CompilerOutputSchema = z.object({
  compiledPrompt: CompiledPromptSchema,
  executionSummary: z.string(),
  selectedRules: z.array(RuleDefinitionSchema),
  selectedEngines: z.array(EngineDefinitionSchema),
  validationResult: ValidationReportSchema
});
export type CompilerOutput = z.infer<typeof CompilerOutputSchema>;
