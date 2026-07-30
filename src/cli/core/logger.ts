import { CLIConfig } from "./config";

export class Logger {
  constructor(private config: CLIConfig) {}

  info(msg: string) {
    if (!this.config.quiet) console.log(msg);
  }

  debug(msg: string) {
    if (this.config.verbose && !this.config.quiet) {
      console.log(`[DEBUG] ${msg}`);
    }
  }

  error(msg: string, code: string, suggestion: string) {
    console.error(`[ERROR] ${code}: ${msg}`);
    console.error(`[SUGGESTION] ${suggestion}`);
  }
}
