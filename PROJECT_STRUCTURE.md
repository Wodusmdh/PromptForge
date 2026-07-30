# Project Structure

```text
/
├── frontend/                 # React/Vite SPA
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # UI Components
│   │   ├── hooks/            # React hooks
│   │   ├── services/         # API client
│   │   ├── types/            # Shared TypeScript types
│   │   └── views/            # Main application views
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── api/              # Route handlers and controllers
│   │   ├── middleware/       # Express middleware
│   │   └── server.ts         # Application entry point
├── compiler/                 # Core PromptForge Compiler
│   ├── src/
│   │   ├── core/             # Pipeline orchestrator and assembler
│   │   ├── engines/          # Specialized processing engines
│   │   ├── parsers/          # Input parsing and validation
│   │   ├── resolvers/        # Dependency and conflict resolution
│   │   └── validators/       # Output validation logic
├── shared/                   # Code shared across environments
│   ├── src/
│   │   ├── models/           # Data models and schemas (Zod)
│   │   └── utils/            # Common utility functions
├── storage/                  # Database scripts and migrations
├── tests/                    # Global test suite
│   ├── unit/                 # Unit tests for individual functions
│   ├── integration/          # Integration tests for pipeline
│   └── e2e/                  # End-to-end browser tests
├── docs/                     # Documentation
│   ├── architecture/         # Architectural specs (this folder)
│   └── api/                  # API documentation
├── config/                   # Configuration files (eslint, prettier, etc.)
├── package.json              # Root package metadata
└── tsconfig.json             # Root TypeScript config
```
