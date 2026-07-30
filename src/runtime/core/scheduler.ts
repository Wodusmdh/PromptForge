import { CompilerOrchestrator } from "../../compiler/core/orchestrator";
import { UserRequest } from "../../compiler/models/schemas";
import { CompilerOutput } from "../../compiler/models/domain";
import { IExecutionContext, IRuntimeConfig, IRuntimeEngine } from "../models/types";
import { ILogger } from "../telemetry/logger";
import { IMetricsCollector } from "../telemetry/metrics";
import { IEngineManager } from "../engines/engineManager";
import { IPipelineExecutor } from "./pipelineExecutor";
import { IValidationRuntime } from "../validation/validationRuntime";
import { IContextManager } from "./contextManager";

export class RuntimeScheduler {
  constructor(
    private compiler: CompilerOrchestrator,
    private engineManager: IEngineManager,
    private pipelineExecutor: IPipelineExecutor,
    private validationRuntime: IValidationRuntime,
    private contextManager: IContextManager,
    private logger: ILogger,
    private metrics: IMetricsCollector,
    private config: IRuntimeConfig
  ) {}

  async run(request: UserRequest): Promise<CompilerOutput> {
    this.logger.info("Initializing Runtime Scheduler...");
    
    // 1. Compiler pass
    let compilerOutput: CompilerOutput;
    try {
      compilerOutput = await this.compiler.compile(request);
      this.logger.info("Compiler pass completed.");
    } catch (e) {
      this.logger.error("Compiler pass failed", e);
      this.metrics.recordSuccess(false);
      throw e;
    }

    // 2. Setup Context
    const executionContext: IExecutionContext = {
      request,
      rules: { mandatory: compilerOutput.selectedRules, optional: [], conflictsDetected: false },
      selectedEngines: compilerOutput.selectedEngines,
      intermediateOutputs: {},
      status: "running",
      tokenBudget: this.config.tokenLimit
    };

    // 3. Load Engines
    let enginesToRun: IRuntimeEngine[];
    try {
      enginesToRun = this.engineManager.loadRequiredEngines(compilerOutput.selectedEngines);
    } catch (e) {
      this.logger.error("Failed to load required engines", e);
      this.metrics.recordSuccess(false);
      throw e;
    }

    // 4. Execute engines
    try {
      await this.pipelineExecutor.executeSequence(enginesToRun, executionContext);
    } catch (e) {
      this.logger.error("Pipeline execution failed", e);
      executionContext.status = "failed";
      this.metrics.recordSuccess(false);
      throw e;
    }

    // 5. Finalize output
    executionContext.finalOutput = compilerOutput.compiledPrompt; // In reality, we'd weave intermediate outputs into the final prompt here
    
    this.contextManager.manageBudget(executionContext);

    const validationResult = this.validationRuntime.validateFinal(executionContext);
    if (!validationResult.isValid) {
      this.logger.warn("Validation failed on final output", validationResult.errors);
      // Depending on config, we might abort or just warn
    }

    executionContext.status = "completed";
    this.metrics.recordSuccess(true);
    
    this.logger.info("Runtime execution finished.");
    
    // Update the output with potential runtime modifications
    return {
      ...compilerOutput,
      compiledPrompt: executionContext.finalOutput!,
      executionSummary: compilerOutput.executionSummary + " | Runtime executed successfully."
    };
  }
}
