export interface CLIConfig {
  apiUrl: string;
  apiKey?: string;
  outputFormat: "human" | "json" | "yaml" | "markdown";
  verbose: boolean;
  quiet: boolean;
}

export class ConfigManager {
  static load(args: Record<string, any>): CLIConfig {
    // 3. Config file (mock)
    const fileConfig = { apiUrl: "https://api.promptforge.dev/v1", outputFormat: "human", verbose: false, quiet: false };
    
    // 2. Env Vars
    const envConfig = {
      apiUrl: process.env.PF_API_URL,
      apiKey: process.env.PF_API_KEY,
      outputFormat: process.env.PF_OUTPUT_FORMAT,
    };

    // 1. CLI Args
    const cliConfig = {
      apiUrl: args.apiUrl,
      apiKey: args.apiKey,
      outputFormat: args.format,
      verbose: args.verbose,
      quiet: args.quiet
    };

    return {
      apiUrl: cliConfig.apiUrl || envConfig.apiUrl || fileConfig.apiUrl,
      apiKey: cliConfig.apiKey || envConfig.apiKey,
      outputFormat: (cliConfig.outputFormat || envConfig.outputFormat || fileConfig.outputFormat) as any,
      verbose: cliConfig.verbose || fileConfig.verbose,
      quiet: cliConfig.quiet || fileConfig.quiet
    };
  }
}
