import { Request, Response, NextFunction } from "express";
import { PromptForgeError } from "./errors";

export function validateCompileRequest(req: Request, res: Response, next: NextFunction) {
  const { idea, targetAssistant } = req.body;
  if (!idea || typeof idea !== "string") {
    return next(new PromptForgeError(400, "VALIDATION_ERROR", "Missing or invalid 'idea'.", "The request body must include a string 'idea'."));
  }
  if (!targetAssistant || typeof targetAssistant !== "string") {
    return next(new PromptForgeError(400, "VALIDATION_ERROR", "Missing or invalid 'targetAssistant'."));
  }
  next();
}
