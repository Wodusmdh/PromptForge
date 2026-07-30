# PromptForge Rule Intelligence & Knowledge Base

## Objective
The Rule Intelligence subsystem parses, categorizes, caches, and retrieves PromptForge rules intelligently. Instead of blindly passing a massive rule specification into the compiler, this module selectively injects *only the relevant rules* based on the context of the user request.

## Architecture

- **Rule Database**: Serves as the persistence layer mapping rule records and maintaining version history.
- **Search Engine & Indexer**: Provides Keyword indexing for fast search and scoring to identify contextually relevant rules.
- **Selector**: Categorizes matching rules into Mandatory, Optional, and Ignored sets, providing explanations for selection.
- **Conflict Detector**: Scans combinations of rules to detect conflicting combinations (e.g., standard vs legacy rules) and explicitly flagged deprecations.
- **Rule Cache**: An LRU (Memory) cache that stores frequently requested rules to avoid repeated processing overhead.
- **Rule Analytics**: Keeps telemetry on rule usage, guiding the deprecation or promotion of frequently/infrequently used specifications.

## Folder Structure
```text
src/intelligence/
├── analytics/
│   └── analytics.ts
├── cache/
│   └── ruleCache.ts
├── database/
│   └── ruleDb.ts
├── models/
│   └── schema.ts
├── search/
│   ├── indexer.ts
│   └── searchEngine.ts
├── selection/
│   ├── conflictDetector.ts
│   └── selector.ts
└── tests/
    └── intelligence.test.ts
```

## Testing
Run the suite via:
```bash
npm run test:intelligence
```
