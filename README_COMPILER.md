# PromptForge Compiler - Phase 1

## Overview
Phase 1 establishes the foundational layer of the PromptForge Compiler. It introduces the robust data modeling, error handling, rule registry, engine registry, and pipeline orchestration skeleton required for the DAG-based execution environment.

## A. Architecture Explanation
The compiler uses a layered modular architecture:
- **Models**: Defines strict boundaries using Zod to ensure runtime type-safety of all internal data structures (Requests, Intents, Plans, and Sections).
- **Core**: Contains the `RequestParser` for ingesting user configurations, custom error hierarchies (`ValidationError`, `EngineError`), and the `CompilerPipeline` that directs traffic.
- **Rules**: A central `RuleRegistry` stores the canonical constraints (from the PromptForge Specification). A `StaticRuleLoader` acts as the source-of-truth reader.
- **Engines**: The `EngineRegistry` collects specialized modules (e.g., UI Engine, Database Engine) and topologically sorts them into an `ExecutionPlan` based on declared dependencies.

## B. Folder Structure
```text
src/compiler/
├── core/
│   ├── errors.ts
│   ├── parser.ts
│   └── pipeline.ts
├── engines/
│   ├── interface.ts
│   └── registry.ts
├── models/
│   └── schemas.ts
├── rules/
│   ├── loader.ts
│   ├── registry.ts
│   └── types.ts
└── tests/
    └── pipeline.test.ts
```

## C. Implementation Code
Implementation code has been successfully generated in `src/compiler/*`. The foundation enforces strict validation and uses `zod` for parsing and sanitizing inputs.

## D. Setup Instructions
1. Install dependencies:
   ```bash
   npm install zod
   ```
2. The core types and models are automatically integrated into the existing TypeScript compilation via the `package.json` and `tsconfig.json`.

## E. Testing Instructions
A full test suite verifying Data Models, Rule Loading, Engine Registration, and Pipeline Execution Plan Generation has been provided.

To run the compiler foundation tests:
```bash
npm run test:compiler
```
