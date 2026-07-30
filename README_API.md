# PromptForge API

## Objective
The PromptForge API exposes the Compiler, Runtime, Rule Intelligence, and Optimization Engine to external systems. It ensures strict schema validation, robust authentication, rate limiting, and standard error handling.

## Architecture

- **Routes**: Defines the public and protected endpoints.
- **Controllers**: Thin wrappers that route the API payloads into the underlying PromptForge engines (Compiler, Runtime, Optimizer).
- **Middleware**:
  - `auth`: Validates API Keys or JWT tokens, assigning user roles.
  - `rateLimit`: Provides burst protection and per-user throttling.
  - `logger`: Logs requests, latencies, and unique trace IDs.
  - `errorHandler`: Converts domain exceptions into standardized `ApiError` responses.
- **Models**: Defines data schemas and custom errors.
- **Docs**: OpenAPI 3.1 specification for Swagger UI generation.
- **Clients**: Example SDK implementations in TypeScript, Python, and Go.

## Endpoints
- `GET /health` - System status.
- `GET /version` - Engine versioning.
- `POST /compile` - Submit an `ExecutionPlan`.
- `POST /optimize` - Compress and analyze a prompt.
- `POST /analyze` - Score a prompt's quality.
- `POST /validate` - Verify rule adherence.
- `POST /rules/search` - Hybrid search the intelligence index.

## Folder Structure
```text
src/api/
├── clients/
│   ├── go.go
│   ├── python.py
│   └── typescript.ts
├── controllers/
│   ├── promptController.ts
│   ├── ruleController.ts
│   └── systemController.ts
├── docs/
│   └── openapi.yaml
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   ├── logger.ts
│   └── rateLimit.ts
├── models/
│   ├── errors.ts
│   └── schemas.ts
├── routes/
│   └── index.ts
└── tests/
    └── api.test.ts
```

## Testing
Run the API integration tests using Supertest:
```bash
npm run test:api
```
