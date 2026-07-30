# PromptForge CLI

## Objective
The PromptForge CLI serves as the primary developer interface for local compilation, rule validation, optimization, and CI/CD automation. It connects directly to the PromptForge API and local configurations.

## Architecture

- **Commands Hierarchy**: Implements subcommands (`compile`, `optimize`, `analyze`, `validate`, `rules search`, `engines list`, `config`, `doctor`, `init`).
- **Configuration Manager**: Supports hierarchical configuration resolution: CLI Arguments > Environment Variables > Config File.
- **Output Formatter**: Supports structural outputs for piping/scripting (`json`, `yaml`) and `human`-readable and `markdown` rendering for manual usage.
- **Logger**: Implements `--verbose` and `--quiet` modes.
- **Error Handling**: Deterministic exit codes with actionable suggestions.

## Folder Structure
```text
src/cli/
├── commands/
│   └── compile.ts
├── core/
│   ├── config.ts
│   ├── errors.ts
│   ├── logger.ts
│   └── output.ts
├── index.ts
├── tests/
│   └── cli.test.ts
└── utils/
    ├── batch.ts
    └── interactive.ts
```

## Example Commands
```bash
# Initialize a new workspace
pf init

# Compile with verbose logging
pf compile "Build a React dashboard" --verbose

# Compile and output raw JSON for pipeline usage
pf compile "Build a React dashboard" --format=json > prompt.json

# Optimize an existing prompt
pf optimize ./prompt.json

# Search for relevant intelligence rules
pf rules search "security"

# Run environment diagnostics
pf doctor
```

## Configuration System
You can configure the CLI using a `promptforge.json` file, environment variables, or arguments:

| Config | Environment Variable | CLI Argument | Default |
|--------|-----------------------|--------------|---------|
| API URL | `PF_API_URL` | `--api-url` | `https://api.promptforge.dev/v1` |
| API Key | `PF_API_KEY` | `--api-key` | `null` |
| Output | `PF_OUTPUT_FORMAT` | `--format` | `human` |

## Testing
Run the CLI integration suite:
```bash
npm run test:cli
```
