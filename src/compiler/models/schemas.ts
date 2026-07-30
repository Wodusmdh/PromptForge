import { z } from "zod";

// 1. UserRequest
export const UserRequestSchema = z.object({
  id: z.string().uuid().optional(),
  idea: z.string().min(1, "Idea is required"),
  targetAssistant: z.enum(["gemini-ai-studio", "cursor-claude", "bolt-v0", "windsurf", "generic"]),
  complexity: z.enum(["Small", "Medium", "Large", "Enterprise"]),
  stack: z.string(),
  architectureStyle: z.string(),
  uiStyle: z.string(),
  dbType: z.string(),
  securityLevel: z.string(),
  additionalRules: z.string().optional(),
  timestamp: z.date().optional().default(() => new Date()),
});
export type UserRequest = z.infer<typeof UserRequestSchema>;

// 2. ParsedIntent
export const ParsedIntentSchema = z.object({
  primaryGoal: z.string(),
  secondaryGoals: z.array(z.string()),
  targetAudience: z.string(),
  businessDomain: z.string(),
  technicalScope: z.string(),
  assumptions: z.array(z.string()),
});
export type ParsedIntent = z.infer<typeof ParsedIntentSchema>;

// 3. Requirement
export const RequirementSchema = z.object({
  id: z.string(),
  type: z.enum(["Functional", "Non-Functional", "Security", "Performance"]),
  description: z.string(),
  priority: z.enum(["Must-Have", "Should-Have", "Could-Have"]),
  dependencies: z.array(z.string()).default([]), // IDs of other requirements
});
export type Requirement = z.infer<typeof RequirementSchema>;

// 4. RuleDefinition
export const RuleDefinitionSchema = z.object({
  id: z.string(),
  section: z.string(),
  content: z.string(),
  enforcementLevel: z.enum(["Strict", "Guideline"]),
  dependencies: z.array(z.string()).default([]),
});
export type RuleDefinition = z.infer<typeof RuleDefinitionSchema>;

// 5. EngineDefinition
export const EngineDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Generator", "Validator", "Analyzer"]),
  dependencies: z.array(z.string()).default([]),
});
export type EngineDefinition = z.infer<typeof EngineDefinitionSchema>;

// 6. ExecutionPlan
export const ExecutionPlanSchema = z.object({
  id: z.string().uuid(),
  stages: z.array(z.array(EngineDefinitionSchema)), // Array of parallel execution groups
  status: z.enum(["Pending", "Running", "Completed", "Failed"]),
});
export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;

// 7. PromptSection
export const PromptSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  order: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type PromptSection = z.infer<typeof PromptSectionSchema>;

// 8. CompiledPrompt
export const CompiledPromptSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  sections: z.array(PromptSectionSchema),
  compiledMarkdown: z.string(),
  qualityScore: z.number().min(0).max(100),
  estimatedTokens: z.number().nonnegative(),
});
export type CompiledPrompt = z.infer<typeof CompiledPromptSchema>;

// 9. ValidationResult
export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
