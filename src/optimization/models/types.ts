import { CompiledPrompt } from "../../compiler/models/schemas";

export interface IOptimizationResult {
  original: CompiledPrompt;
  optimized: CompiledPrompt;
  metrics: IOptimizationMetrics;
  diff: IPromptDiff;
}

export interface IOptimizationMetrics {
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  qualityScoreDelta: number;
}

export interface IPromptDiff {
  removed: string[];
  added: string[];
  reordered: boolean;
  preservedIntent: boolean;
}

export interface IQualityScore {
  completeness: number;
  ambiguity: number;
  readability: number;
  consistency: number;
  efficiency: number;
  overall: number;
}

export interface IBenchmarkResult {
  tokenReduction: number;
  readabilityDelta: number;
  executionConsistency: number;
  requirementPreservation: number;
  success: boolean;
}
