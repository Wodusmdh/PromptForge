import { UserRequest, EngineDefinition } from "../../compiler/models/schemas";
import { RuleSet } from "../../compiler/models/domain";
import { CompiledPrompt } from "../../compiler/models/schemas";

export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface IRuntimeEngine {
  definition: EngineDefinition;
  execute(context: IExecutionContext): Promise<any>;
}

export interface IExecutionContext {
  request: UserRequest;
  rules: RuleSet;
  selectedEngines: EngineDefinition[];
  intermediateOutputs: Record<string, any>;
  finalOutput?: CompiledPrompt;
  status: ExecutionStatus;
  tokenBudget: number;
}

export interface IRuntimeConfig {
  maxRetries: number;
  tokenLimit: number;
  enableTelemetry: boolean;
}

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ITelemetryEvent {
  eventName: string;
  timestamp: Date;
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface IMetricsSnapshot {
  totalExecutionTimeMs: number;
  engineUsage: Record<string, number>;
  tokenUsage: number;
  successRate: number;
}
