import { CompiledPrompt } from "../../compiler/models/schemas";
import { IOptimizationResult } from "../models/types";
import { PromptCompressor } from "../compressor/compressor";
import { ContextOptimizer } from "./contextOptimizer";
import { PromptQualityAnalyzer } from "../analyzer/qualityAnalyzer";
import { SemanticPreservationVerifier } from "../preservation/semanticPreservation";
import { PromptDiffGenerator } from "../diff/promptDiff";

export class PromptOptimizer {
  constructor(
    private compressor: PromptCompressor,
    private contextOptimizer: ContextOptimizer,
    private qualityAnalyzer: PromptQualityAnalyzer,
    private verifier: SemanticPreservationVerifier,
    private diffGenerator: PromptDiffGenerator
  ) {}

  optimize(prompt: CompiledPrompt): IOptimizationResult {
    const origQuality = this.qualityAnalyzer.analyze(prompt);
    
    let optimized = this.compressor.compress(prompt);
    optimized = this.contextOptimizer.optimizeContext(optimized);
    
    const newQuality = this.qualityAnalyzer.analyze(optimized);
    optimized.qualityScore = newQuality.overall;

    const isPreserved = this.verifier.verify(prompt, optimized);
    if (!isPreserved) {
      throw new Error("Optimization failed: Semantic meaning or requirements lost.");
    }

    const diff = this.diffGenerator.generate(prompt, optimized, isPreserved);

    return {
      original: prompt,
      optimized,
      diff,
      metrics: {
        originalTokens: prompt.estimatedTokens,
        optimizedTokens: optimized.estimatedTokens,
        reductionPercentage: prompt.estimatedTokens > 0 
          ? ((prompt.estimatedTokens - optimized.estimatedTokens) / prompt.estimatedTokens) * 100
          : 0,
        qualityScoreDelta: newQuality.overall - origQuality.overall
      }
    };
  }
}
