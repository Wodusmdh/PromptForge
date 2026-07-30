import { Request, Response, NextFunction } from "express";
import { PromptForgeError, ApiError } from "../models/errors";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  if (err instanceof PromptForgeError) {
    const response: ApiError = {
      code: err.code,
      message: err.message,
      cause: err.cause,
      suggestedFix: err.suggestedFix
    };
    return res.status(err.statusCode).json(response);
  }

  const response: ApiError = {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
    cause: err.message,
    suggestedFix: "Please try again later or contact support."
  };
  return res.status(500).json(response);
}
