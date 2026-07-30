# PromptForge v2.0

PromptForge is an advanced context injection and prompt generation engine. It enables scalable, rule-based generation of robust LLM prompts tailored for specialized software engineering domains.

## Core Architecture

PromptForge operates via a distributed architecture separated into 7 core modules:

1. **Specification**: Core YAML configurations, rules, and definitions defining domain knowledge and constraints.
2. **Compiler**: Compiles human-readable execution plans into strongly-typed `CompiledPrompt` trees.
3. **Runtime**: The execution engine that triggers and orchestrates `IEnginePlugin` pipelines against a provided context window and calculates dynamic token allocations.
4. **Engine SDK**: A plugin development kit allowing developers to hook into the runtime lifecycle (e.g. `beforeExecution`, `onValidation`) to augment generative behaviors.
5. **Rule Intelligence**: Replaces blanket ruleset injection with dynamic, semantic querying. It determines Mandatory, Optional, and Ignored rules on a per-request basis and spots conflicts.
6. **Prompt Optimization Engine**: Reduces token usage, consolidates redundancy, and ensures semantic constraints are maintained, scoring results with numeric metrics.
7. **API & CLI**: Exposes the core systems to external environments via a versioned, secure REST API, and provides a powerful developer terminal experience (`pf`).

## Documentation

- [Specification & Configuration](README_SPEC.md)
- [Compiler & Runtime](README_COMPILER.md)
- [Engine SDK](README_SDK.md)
- [Rule Intelligence](README_INTELLIGENCE.md)
- [Optimization Engine](README_OPTIMIZATION.md)
- [API Reference](README_API.md)
- [CLI Reference](README_CLI.md)

## Installation & Testing

```bash
npm install

# Run All Tests
npm run test:compiler
npm run test:runtime
npm run test:sdk
npm run test:intelligence
npm run test:optimization
npm run test:api
npm run test:cli
```
