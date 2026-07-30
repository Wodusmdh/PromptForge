# PromptForge Prompt Optimization Engine

## Objective
The Prompt Optimization Engine applies post-processing steps to compiled prompts. It removes token bloat, restructures for optimal context windows, and detects redundancies—all while strictly preserving the semantic intent and mandatory rule requirements of the original output.

## Architecture

- **Prompt Compressor**: Reduces token usage by identifying unused information or condensing instructions.
- **Redundancy Detector**: Analyzes text to find identical or highly overlapping requirements across different sections.
- **Context Optimizer**: Reorders prompt sections into their optimal positions (e.g. putting context first, constraints last) to maximize LLM recall performance.
- **Prompt Quality Analyzer**: Provides numeric scoring across completeness, ambiguity, readability, consistency, and efficiency.
- **Semantic Preservation**: Verifies that the prompt diff did not inadvertently erase or mutate critical intent constraints.
- **Benchmark Engine**: Tracks improvements between the original and optimized output.
- **Prompt Diff**: Calculates explicitly what was injected, removed, or restyled.

## Folder Structure
```text
src/optimization/
├── analyzer/
│   └── qualityAnalyzer.ts
├── benchmark/
│   └── benchmarkEngine.ts
├── compressor/
│   ├── compressor.ts
│   └── redundancyDetector.ts
├── core/
│   ├── contextOptimizer.ts
│   └── optimizer.ts
├── diff/
│   └── promptDiff.ts
├── models/
│   └── types.ts
├── preservation/
│   └── semanticPreservation.ts
└── tests/
    └── optimization.test.ts
```

## Testing
Run the benchmark and integration test suite:
```bash
npm run test:optimization
```
