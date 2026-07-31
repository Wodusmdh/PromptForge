import sys

with open('src/api/middleware/errorHandler.ts', 'r') as f:
    content = f.read()

replacement = """import { Request, Response, NextFunction } from "express";
import { PromptForgeError, ApiError } from "../models/errors";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[API ERROR] ${req.method} ${req.path}`, err.message || err);

  if (err instanceof PromptForgeError) {
    const response: ApiError = {
      code: err.code,
      message: err.message,
      cause: err.cause,
      suggestedFix: err.suggestedFix
    };
    return res.status(err.statusCode).json(response);
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      code: "PAYLOAD_TOO_LARGE",
      message: "Request payload is too large.",
      suggestedFix: "Reduce the size of your request payload."
    });
  }

  const response: ApiError = {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
    suggestedFix: "Please try again later or contact support."
  };
  return res.status(500).json(response);
}
"""

with open('src/api/middleware/errorHandler.ts', 'w') as f:
    f.write(replacement)
