import { ConsoleLogger } from "./telemetry/logger";
import { MetricsCollector } from "./telemetry/metrics";
import { ErrorRecovery } from "./error/recovery";
import { ContextManager } from "./core/contextManager";
import { ValidationRuntime } from "./validation/validationRuntime";
import { EngineManager } from "./engines/engineManager";
import { PipelineExecutor } from "./core/pipelineExecutor";
import { RuntimeScheduler } from "./core/scheduler";
import { createCompiler } from "../compiler/di";
import { IRuntimeConfig } from "./models/types";

export function createRuntime(config: IRuntimeConfig): RuntimeScheduler {
  const logger = new ConsoleLogger();
  const metrics = new MetricsCollector();
  
  const errorRecovery = new ErrorRecovery(logger);
  const contextManager = new ContextManager(logger);
  const validationRuntime = new ValidationRuntime(logger);
  
  const engineManager = new EngineManager();
  const pipelineExecutor = new PipelineExecutor(logger, metrics, errorRecovery);
  
  const compiler = createCompiler();

  return new RuntimeScheduler(
    compiler,
    engineManager,
    pipelineExecutor,
    validationRuntime,
    contextManager,
    logger,
    metrics,
    config
  );
}
