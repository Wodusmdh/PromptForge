import { IExecutionContext } from "../models/types";
import { ILogger } from "../telemetry/logger";

export interface IContextManager {
  manageBudget(context: IExecutionContext): void;
  compressContext(context: IExecutionContext): void;
}

export class ContextManager implements IContextManager {
  constructor(private logger: ILogger) {}

  manageBudget(context: IExecutionContext): void {
    // In production, we evaluate token usage against the context.tokenBudget.
    this.logger.info(`Managing token budget... (Limit: ${context.tokenBudget})`);
    
    // Naive check
    let currentUsage = 0;
    if (context.finalOutput) {
      currentUsage = context.finalOutput.estimatedTokens;
    }

    if (currentUsage > context.tokenBudget) {
      this.compressContext(context);
    }
  }

  compressContext(context: IExecutionContext): void {
    this.logger.info("Compressing context to fit budget...");
    // E.g., remove optional rules, summarize intermediate outputs
    context.rules.optional = []; 
  }
}
