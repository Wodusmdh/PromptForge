# Execution Pipeline

The execution pipeline outlines the lifecycle of a PromptForge generation request.

## 1. User Request
- The user submits a configuration payload via the web interface.
- Data includes the core idea, chosen tech stack, and target AI assistant.

## 2. Parsed Request
- The API layer receives the request.
- The **Input Parser** validates the JSON payload.
- Default values are applied to missing optional fields.

## 3. Retrieved Rules
- The **Intent Analyzer** processes the parsed request to determine scope.
- The **Rule Retriever** fetches the applicable rules from the canonical specification based on the tech stack and security level.

## 4. Selected Engines
- The **Engine Selector** determines which processing modules are required (e.g., UI/UX Engine, Database Engine).
- The **Dependency Resolver** creates a DAG (Directed Acyclic Graph) of these engines to form an `ExecutionPlan`.

## 5. Compiled Prompt
- The pipeline executes the `ExecutionPlan`.
- The **Requirement Extractor** and generative engines produce partial outputs.
- The **Conflict Resolver** ensures consistency across module outputs.
- The **Context Optimizer** prunes redundant data.
- The **Prompt Assembler** merges all data into structured `PromptSection`s.

## 6. Validated Prompt
- The assembled prompt passes through the **Validation Pipeline**.
- The pipeline verifies that all retrieved rules are adhered to and that structural constraints are met.
- Re-generation or correction steps may trigger if validation fails.

## 7. Final Output
- The **Output Generator** serializes the validated prompt into the `ForgedPromptData` format.
- The backend API returns this payload to the client for rendering and consumption.
