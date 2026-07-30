export type AIProviderName = "gemini" | "openai" | "anthropic" | "local" | "generic";

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
}

export interface ModelCapability {
  coding: number; // 1-10
  reasoning: number;
  vision: boolean;
  structuredOutput: boolean;
  streaming: boolean;
  longContext: boolean;
}

export interface ModelDefinition {
  id: string;
  provider: AIProviderName;
  displayName: string;
  contextWindow: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  capabilities: ModelCapability;
  latencyTier: "low" | "medium" | "high";
  availability: "high" | "medium" | "low";
}

export type RoutingStrategy =
  | "manual"
  | "auto"
  | "cheapest"
  | "fastest"
  | "quality"
  | "balanced"
  | "ensemble";

export interface RoutingRequirements {
  taskType: "code" | "architecture" | "review" | "synthesis" | "analysis" | "general";
  minCodingCapability?: number;
  minReasoningCapability?: number;
  requireVision?: boolean;
  requireStructuredOutput?: boolean;
  maxLatency?: "low" | "medium" | "high";
  maxCostPer1k?: number;
}

export interface RoutingDecision {
  strategy: RoutingStrategy;
  primaryModel: ModelDefinition;
  secondaryModel?: ModelDefinition;
  reviewModel?: ModelDefinition;
  synthesisModel?: ModelDefinition;
  reasoning: string;
}

export type ExecutionState =
  | "IDLE"
  | "ANALYZING"
  | "ROUTING"
  | "ESTIMATING"
  | "AWAITING_CONFIRMATION"
  | "EXECUTING"
  | "REVIEWING"
  | "COMPARING"
  | "SYNTHESIZING"
  | "VALIDATING"
  | "COMPLETED"
  | "COMPLETED_WITH_WARNINGS"
  | "REQUIRES_CLARIFICATION"
  | "BLOCKED"
  | "FAILED"
  | "CANCELLED";

export interface OrchestrationRun {
  id: string;
  taskId: string;
  state: ExecutionState;
  decision: RoutingDecision | null;
  budgetConsumed: number;
  maxBudget: number;
  createdAt: string;
  updatedAt: string;
  result: any | null;
  warnings: string[];
}
