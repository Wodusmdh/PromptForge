import { PromptOptimizer } from "../core/optimizer";
import { PromptCompressor } from "../compressor/compressor";
import { RedundancyDetector } from "../compressor/redundancyDetector";
import { ContextOptimizer } from "../core/contextOptimizer";
import { PromptQualityAnalyzer } from "../analyzer/qualityAnalyzer";
import { SemanticPreservationVerifier } from "../preservation/semanticPreservation";
import { PromptDiffGenerator } from "../diff/promptDiff";
import { BenchmarkEngine } from "../benchmark/benchmarkEngine";
import { CompiledPrompt } from "../../compiler/models/schemas";
import assert from "assert";

async function runTests() {
  console.log("Starting Prompt Optimization Integration Tests...");

  const redundancyDetector = new RedundancyDetector();
  const compressor = new PromptCompressor(redundancyDetector);
  const contextOptimizer = new ContextOptimizer();
  const qualityAnalyzer = new PromptQualityAnalyzer();
  const verifier = new SemanticPreservationVerifier();
  const diffGen = new PromptDiffGenerator();

  const optimizer = new PromptOptimizer(
    compressor,
    contextOptimizer,
    qualityAnalyzer,
    verifier,
    diffGen
  );
  
  const benchmarkEngine = new BenchmarkEngine();

  const originalPrompt: CompiledPrompt = {
    id: "test-123",
    title: "Test Prompt",
    summary: "A test prompt",
    sections: [
      { title: "Requirements", content: "Do this. Do that. Do that.", order: 2 },
      { title: "Context", content: "Some context.", order: 1 }
    ],
    compiledMarkdown: "## Requirements\nDo this. Do that. Do that.\n\n## Context\nSome context.",
    qualityScore: 80,
    estimatedTokens: 12
  };

  const result = optimizer.optimize(originalPrompt);
  
  const benchmark = benchmarkEngine.runBenchmark(result);

  console.log("--- OPTIMIZATION RESULTS ---");
  console.log("Original Tokens:", result.metrics.originalTokens);
  console.log("Optimized Tokens:", result.metrics.optimizedTokens);
  console.log("Reduction %:", result.metrics.reductionPercentage.toFixed(2));
  console.log("Preserved Intent:", result.diff.preservedIntent);
  console.log("Benchmark Success:", benchmark.success);

  assert.ok(result.metrics.optimizedTokens <= result.metrics.originalTokens);
  assert.ok(result.diff.preservedIntent);
  assert.ok(result.optimized.sections[0].title === "Context", "Sections were reordered");

  console.log("Prompt Optimization integration test passed successfully.");
}

runTests().catch(console.error);
