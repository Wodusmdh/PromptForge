import { ILogger } from "../telemetry/logger";

export interface IErrorRecovery {
  executeWithRetry<T>(operation: () => Promise<T>, maxRetries: number, contextInfo: string): Promise<T>;
}

export class ErrorRecovery implements IErrorRecovery {
  constructor(private logger: ILogger) {}

  async executeWithRetry<T>(operation: () => Promise<T>, maxRetries: number, contextInfo: string): Promise<T> {
    let attempts = 0;
    let lastError: any;

    while (attempts < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        lastError = error;
        this.logger.warn(`Failed ${contextInfo}. Attempt ${attempts} of ${maxRetries}.`, error);
        if (attempts >= maxRetries) {
          this.logger.error(`Exhausted retries for ${contextInfo}.`);
          throw error;
        }
        // Exponential backoff could be added here
        await new Promise(res => setTimeout(res, 100 * attempts));
      }
    }
    throw lastError;
  }
}
