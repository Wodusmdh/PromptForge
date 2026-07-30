# PromptForge Engine SDK & Plugin System

## Objective
The Engine SDK provides a modular, extensible architecture allowing third-party developers to build, test, and register custom generative or analytical Engines for the PromptForge ecosystem, without modifying the Compiler Core.

## SDK Architecture
The SDK implements a strict Plugin API:
- **`IEnginePlugin` Interface**: The contract every Engine must fulfill (`initialize`, `load`, `execute`, `validate`, `unload`).
- **Metadata**: Strict manifest definitions ensuring proper dependency resolution and security sandboxing.
- **Dependency Resolver**: Analyzes Engine requirements and performs Topological Sorting to detect circular dependencies and ensure correct execution ordering.
- **Plugin Registry**: Manages the loading, enabling, and ordered retrieval of registered Engines.
- **Lifecycle Manager & Event System**: Orchestrates the execution phases while emitting standard hooks (`beforeExecution`, `onValidation`, etc.) for metrics or side-effects.
- **Security Sandbox**: Intercepts plugin execution to verify requested capabilities (e.g., preventing arbitrary system access via the `permissions` array).

## Implementation Structure
```text
src/sdk/
├── api/
│   └── types.ts             # Core interfaces and metadata schemas
├── core/
│   ├── events.ts            # Hook emitter system
│   ├── lifecycle.ts         # Orchestrator for individual plugin runs
│   ├── registry.ts          # Central storage and state manager
│   └── resolver.ts          # Topological dependency resolver
├── example/
│   └── customEngine.ts      # Reference implementation of a plugin
├── security/
│   └── sandbox.ts           # Permission boundaries
└── tests/
    └── sdk.test.ts          # Verification of the SDK loop
```

## Creating a Custom Engine
Implement the `IEnginePlugin` interface and provide a valid `EngineMetadata` object. 

Example:
```typescript
import { IEnginePlugin, EngineMetadata } from "promptforge-sdk";

export class MyCustomEngine implements IEnginePlugin {
    metadata: EngineMetadata = {
        id: "my-engine",
        name: "Custom Rules Engine",
        category: "Validator",
        dependencies: {},
        permissions: [] // safe
        // ...
    };
    
    async execute(context) {
        // Implementation
    }
}
```

## Testing
Run the SDK test suite:
```bash
npm run test:sdk
```
