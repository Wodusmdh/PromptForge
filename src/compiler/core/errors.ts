import { ZodError } from "zod";

export class CompilerError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = "CompilerError";
  }
}

export class ValidationError extends CompilerError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }

  static fromZod(error: ZodError): ValidationError {
    const issues = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return new ValidationError("Schema validation failed", issues);
  }
}

export class PipelineError extends CompilerError {
  constructor(message: string, details?: any) {
    super(message, "PIPELINE_ERROR", details);
    this.name = "PipelineError";
  }
}

export class EngineError extends CompilerError {
  constructor(message: string, details?: any) {
    super(message, "ENGINE_ERROR", details);
    this.name = "EngineError";
  }
}
