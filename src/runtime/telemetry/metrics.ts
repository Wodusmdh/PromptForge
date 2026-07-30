import { IMetricsSnapshot } from "../models/types";

export interface IMetricsCollector {
  recordEngineExecution(engineId: string, durationMs: number): void;
  recordTokenUsage(tokens: number): void;
  recordSuccess(isSuccess: boolean): void;
  getSnapshot(): IMetricsSnapshot;
}

export class MetricsCollector implements IMetricsCollector {
  private engineUsage: Record<string, number> = {};
  private tokenUsage = 0;
  private totalExecutions = 0;
  private successfulExecutions = 0;

  recordEngineExecution(engineId: string, durationMs: number): void {
    this.engineUsage[engineId] = (this.engineUsage[engineId] || 0) + durationMs;
  }

  recordTokenUsage(tokens: number): void {
    this.tokenUsage += tokens;
  }

  recordSuccess(isSuccess: boolean): void {
    this.totalExecutions++;
    if (isSuccess) this.successfulExecutions++;
  }

  getSnapshot(): IMetricsSnapshot {
    return {
      totalExecutionTimeMs: Object.values(this.engineUsage).reduce((a, b) => a + b, 0),
      engineUsage: this.engineUsage,
      tokenUsage: this.tokenUsage,
      successRate: this.totalExecutions === 0 ? 0 : this.successfulExecutions / this.totalExecutions
    };
  }
}
