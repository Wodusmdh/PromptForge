# PromptForge Core Compiler

## Objective
This repository contains the production implementation of the PromptForge Core Compiler Engine (Modules 1-9). The compiler transforms natural language user requests into a deterministically compiled Master Prompt conforming strictly to the PromptForge v2.0 specification.

## Clean Architecture & SOLID
- **Single Responsibility**: Each stage of the pipeline (Parsing, Extracting, Assembling, Validating) is isolated into its own domain class behind a strict interface (e.g., `IRequestParser`, `IPromptAssembler`).
- **Dependency Inversion**: High-level modules like the `CompilerOrchestrator` do not depend on low-level implementations. Instead, they depend on abstractions (`IValidationPipeline`). 
- **Dependency Injection**: A DI container (`src/compiler/di.ts`) wires up all concrete classes and passes them to the Orchestrator, making the entire pipeline modular and fully testable with mocks.

## Execution Flow
1. **RequestParser**: Parses input, normalizes text, and categorizes requirements.
2. **IntentAnalyzer**: Extracts primary/secondary intents and estimates complexity.
3. **RequirementExtractor**: Builds a dependency graph of functional/non-functional requirements.
4. **RuleRetriever**: Retrieves contextually relevant rules from the Registry.
5. **EngineSelector**: Identifies necessary generational engines.
6. **ConflictResolver**: Detects and mitigates constraints and rule conflicts based on PromptForge precedence.
7. **PromptAssembler**: Formats data into a structured output markdown context.
8. **ValidationPipeline**: Verifies final token counts, mandatory sections, and rule presence.
9. **Orchestrator**: Coordinates all steps and emits the final `CompilerOutput` payload.

## Usage & Testing
A comprehensive integration test simulates the entire end-to-end compilation flow.
Run the tests:
```bash
npm run test:orchestrator
```
