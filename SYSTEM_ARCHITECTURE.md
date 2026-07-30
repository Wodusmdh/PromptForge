# PromptForge System Architecture

## 1. Overall Architecture
The PromptForge Compiler is a full-stack web application designed to synthesize high-quality, deterministic Master Prompts. It consists of a React/Vite SPA frontend, a Node.js/Express backend, and the core Compiler Engine which orchestrates various LLM-powered transformations.

## 2. Component Diagram
```
[ Frontend (React/Vite) ] <--> [ Backend API (Express) ]
                                      |
                               [ Compiler Engine ]
                               /       |         \
                [ Data Models ]  [ LLM Client ]  [ Storage (DB/Cache) ]
```

## 3. Responsibilities
- **Frontend**: Provides the UI for users to configure their prompt requirements (Idea, Tech Stack, UI Style, Security Level, Target Assistant).
- **Backend API**: Exposes endpoints for prompt compilation, refinement, and template retrieval. Manages rate limiting and authentication.
- **Compiler Engine**: The core pipeline that transforms user inputs into a final Master Prompt using a DAG of specialized engines.
- **LLM Client**: Interfaces with the Gemini AI API for generative tasks during the compilation pipeline.
- **Storage**: Stores generated prompts, user history, and system templates.

## 4. Data Flow
1. User configures prompt details in the Frontend.
2. Frontend sends a `POST /api/compiler/forge` request with the configuration payload.
3. Backend parses and validates the request.
4. Backend delegates the request to the Compiler Engine.
5. Compiler Engine runs the multi-stage pipeline, making necessary calls to the LLM Client.
6. Compiler Engine produces a `PromptDocument`.
7. Backend returns the `PromptDocument` to the Frontend.
8. Frontend renders the Master Prompt and associated metadata.

## 5. Request Lifecycle
1. **Ingestion**: The API receives the raw configuration.
2. **Validation**: The configuration is validated against the schema.
3. **Compilation**: The `CompilerPipeline` orchestrates the stages (parsing, extraction, generation).
4. **Assembly**: The generated sections are assembled into the final Markdown.
5. **Validation**: The final output is checked for compliance against the specification.
6. **Response**: The structured response is sent back to the client.
