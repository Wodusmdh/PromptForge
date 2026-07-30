import { ITelemetryEvent } from "../models/types";

export interface ILogger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: any): void;
  logEvent(event: ITelemetryEvent): void;
}

export class ConsoleLogger implements ILogger {
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta ? meta : "");
  }
  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta ? meta : "");
  }
  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error ? error : "");
  }
  logEvent(event: ITelemetryEvent): void {
    console.log(`[EVENT] ${event.eventName}`, event.metadata ? event.metadata : "");
  }
}
