# PromptForge Runtime Engine

## Objective
The Runtime Engine orchestrates the complete execution of PromptForge, taking the `ExecutionPlan` from the Compiler and executing it securely, reliably, and with full observability.

## Architecture
The Runtime Engine is built with high resilience and observability:
- **Runtime Scheduler**: The core entry point (`src/runtime/core/scheduler.ts`) coordinates the Compiler and the runtime pipeline.
- **Engine Manager**: Dynamically loads and validates required generative engines.
- **Pipeline Executor**: Runs engines sequentially with pre/post hooks and handles retry policies.
- **Context Manager**: Monitors the `tokenBudget` and applies semantic compression to the intermediate outputs.
- **Error Recovery**: Transparently catches engine failures, applies exponential backoff, and retries.
- **Telemetry**: Records execution durations, token usage, warnings, and success rates.
- **Validation Runtime**: Runs sanity checks on final outputs.

## Execution Flow
1. **Request Reception**: User config payload is passed to the Runtime Scheduler.
2. **Compiler Pass**: Scheduler calls the core compiler to generate an `ExecutionPlan`.
3. **Engine Hydration**: `EngineManager` resolves the abstract engine definitions into concrete loaded `IRuntimeEngine` instances.
4. **Pipeline Execution**: The `PipelineExecutor` loops through the engines, relying on `ErrorRecovery` to protect against transient API failures.
5. **Context Aggregation**: Intermediate engine outputs are gathered into the `ExecutionContext`. 
6. **Budget Management**: The `ContextManager` verifies the token size and trims optional rules if necessary.
7. **Validation**: `ValidationRuntime` ensures no critical requirements were lost and token limits were adhered to.
8. **Final Output**: The enriched output is returned with `executionSummary` updated by the Runtime.

## Project Structure
```text
src/runtime/
├── core/
│   ├── contextManager.ts
│   ├── pipelineExecutor.ts
│   └── scheduler.ts
├── engines/
│   └── engineManager.ts
├── error/
│   └── recovery.ts
├── models/
│   └── types.ts
├── telemetry/
│   ├── logger.ts
│   └── metrics.ts
├── tests/
│   └── runtime.test.ts
├── validation/
│   └── validationRuntime.ts
└── di.ts
```

## Testing
Integration tests are provided to verify the end-to-end integration between the Runtime and the Core Compiler.

```bash
npm run test:runtime
```
