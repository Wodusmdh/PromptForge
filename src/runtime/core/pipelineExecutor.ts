import { IExecutionContext, IRuntimeEngine } from "../models/types";
import { ILogger } from "../telemetry/logger";
import { IMetricsCollector } from "../telemetry/metrics";
import { IErrorRecovery } from "../error/recovery";

export interface IPipelineExecutor {
  executeSequence(engines: IRuntimeEngine[], context: IExecutionContext): Promise<void>;
}

export class PipelineExecutor implements IPipelineExecutor {
  constructor(
    private logger: ILogger,
    private metrics: IMetricsCollector,
    private errorRecovery: IErrorRecovery
  ) {}

  async executeSequence(engines: IRuntimeEngine[], context: IExecutionContext): Promise<void> {
    for (const engine of engines) {
      this.logger.info(`Starting engine execution: ${engine.definition.name}`);
      const startTime = Date.now();
      
      try {
        const result = await this.errorRecovery.executeWithRetry(
          () => engine.execute(context),
          3, // max retries
          `execution of engine ${engine.definition.name}`
        );
        
        context.intermediateOutputs[engine.definition.id] = result;
        
        const duration = Date.now() - startTime;
        this.metrics.recordEngineExecution(engine.definition.id, duration);
        this.logger.info(`Engine ${engine.definition.name} completed successfully.`);
        
      } catch (error) {
        this.logger.error(`Engine ${engine.definition.name} failed fatally.`);
        throw error;
      }
    }
  }
}
