import { IExecutionContext, IValidationResult } from "../models/types";
import { ILogger } from "../telemetry/logger";

export interface IValidationRuntime {
  validateStage(stageName: string, context: IExecutionContext): IValidationResult;
  validateFinal(context: IExecutionContext): IValidationResult;
}

export class ValidationRuntime implements IValidationRuntime {
  constructor(private logger: ILogger) {}

  validateStage(stageName: string, context: IExecutionContext): IValidationResult {
    this.logger.info(`Validating stage: ${stageName}`);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Simple validation logic
    if (!context.request) {
      errors.push("Missing user request in context");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateFinal(context: IExecutionContext): IValidationResult {
    this.logger.info("Running final validation...");
    const errors: string[] = [];
    
    if (!context.finalOutput) {
      errors.push("Final output is missing.");
    }
    
    if (context.finalOutput && context.finalOutput.estimatedTokens > context.tokenBudget) {
      errors.push("Context overflow detected in final output.");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: []
    };
  }
}
