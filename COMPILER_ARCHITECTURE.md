# Compiler Architecture

The PromptForge Compiler executes a multi-stage pipeline.

## 1. Input Parser
- **Purpose**: Normalizes raw user input into a strongly-typed format.
- **Inputs**: Raw JSON request.
- **Outputs**: `ParsedRequest` object.
- **Internal logic**: Validates fields, applies default values, sanitizes input.
- **Failure handling**: Throws `ValidationError` if required fields are missing.
- **Dependencies**: Zod or similar validation library.

## 2. Intent Analyzer
- **Purpose**: Determines the core business goals and technical scope.
- **Inputs**: `ParsedRequest`.
- **Outputs**: `Intent` object.
- **Internal logic**: Uses LLM to extract primary/secondary goals and target audience.
- **Failure handling**: Retries on parsing failure; falls back to explicit user settings.
- **Dependencies**: LLM Client.

## 3. Requirement Extractor
- **Purpose**: Expands the idea into detailed functional/non-functional requirements.
- **Inputs**: `Intent`, `ParsedRequest`.
- **Outputs**: Array of `Requirement` objects.
- **Internal logic**: Identifies missing features, maps dependencies, and generates business rules.
- **Failure handling**: Marks uncertain requirements for user review.
- **Dependencies**: Intent Analyzer output, LLM Client.

## 4. Rule Retriever
- **Purpose**: Fetches applicable constraints from the canonical specification.
- **Inputs**: `ParsedRequest`, `Intent`.
- **Outputs**: Array of `Rule` objects.
- **Internal logic**: Matches stack and architecture choices with relevant Golden Rules and Governance constraints.
- **Failure handling**: Fails safe by including all baseline rules.
- **Dependencies**: Canonical PromptForge Specification.

## 5. Engine Selector
- **Purpose**: Determines which specialized engines (e.g., DB Engine, UI Engine) need to run.
- **Inputs**: `Intent`, `Requirement` list.
- **Outputs**: List of active `Engine` configurations.
- **Internal logic**: Evaluates tech stack to activate specific generative modules.
- **Failure handling**: Uses a default baseline engine set.
- **Dependencies**: None.

## 6. Dependency Resolver
- **Purpose**: Orders engine execution to ensure data dependencies are met.
- **Inputs**: List of active engines.
- **Outputs**: `ExecutionPlan` (DAG).
- **Internal logic**: Topologically sorts engines based on I/O dependencies.
- **Failure handling**: Detects cyclic dependencies and aborts compilation.
- **Dependencies**: DAG sorting algorithm.

## 7. Conflict Resolver
- **Purpose**: Identifies and resolves contradictory requirements or engine outputs.
- **Inputs**: Engine outputs.
- **Outputs**: Resolved output state.
- **Internal logic**: Prioritizes security over convenience; applies rule hierarchy.
- **Failure handling**: Flags unresolvable conflicts for user intervention.
- **Dependencies**: None.

## 8. Context Optimizer
- **Purpose**: Trims redundant information to fit within context limits.
- **Inputs**: Resolved output state.
- **Outputs**: Optimized state.
- **Internal logic**: Deduplicates rules and requirements; summarizes lengthy sections.
- **Failure handling**: If still too large, truncates lower-priority features.
- **Dependencies**: Token estimator utility.

## 9. Prompt Assembler
- **Purpose**: Formats the optimized state into the final Markdown structure.
- **Inputs**: Optimized state.
- **Outputs**: Raw `PromptDocument`.
- **Internal logic**: Renders sections according to Part 5 (Output Template) of the specification.
- **Failure handling**: Falls back to a basic text renderer if template fails.
- **Dependencies**: Markdown templating engine.

## 10. Validation Pipeline
- **Purpose**: Ensures the assembled prompt meets all quality and governance standards.
- **Inputs**: Raw `PromptDocument`.
- **Outputs**: Validated `PromptDocument`.
- **Internal logic**: Checks for missing sections, structural integrity, and presence of mandatory risk controls.
- **Failure handling**: Triggers self-correction cycle if validation fails.
- **Dependencies**: Rule Retriever output.

## 11. Output Generator
- **Purpose**: Finalizes the payload for the client API.
- **Inputs**: Validated `PromptDocument`.
- **Outputs**: `ForgedPromptData` JSON.
- **Internal logic**: Packages the Markdown with metadata (Quality Score, Token Count).
- **Failure handling**: Serializes safely; handles special characters.
- **Dependencies**: JSON serialization.
