const { PromptCompressor } = require('./src/optimization/compressor/compressor');
const { ContextOptimizer } = require('./src/optimization/core/contextOptimizer');
const { PromptQualityAnalyzer } = require('./src/optimization/analyzer/qualityAnalyzer');
const { SemanticPreservationVerifier } = require('./src/optimization/preservation/semanticPreservation');
const { PromptDiffGenerator } = require('./src/optimization/diff/promptDiff');
const { PromptOptimizer } = require('./src/optimization/core/optimizer');

const comp = new PromptCompressor();
const ctx = new ContextOptimizer();
const qual = new PromptQualityAnalyzer();
const verif = new SemanticPreservationVerifier();
const diff = new PromptDiffGenerator();
const opt = new PromptOptimizer(comp, ctx, qual, verif, diff);

opt.optimize({ estimatedTokens: 500, compiledMarkdown: "test", sections: [] });
