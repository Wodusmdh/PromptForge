import { Request, Response, NextFunction } from "express";
import { PromptForgeError } from "../models/errors";

export function requestTimeout(req: Request, res: Response, next: NextFunction) {
  const timeoutMs = Number(process.env.PROMPTFORGE_REQUEST_TIMEOUT_MS) || 30000;
  
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      next(new PromptForgeError(408, "REQUEST_TIMEOUT", "Request took too long to process.", "The server aborted the request because it exceeded the configured timeout."));
    }
  }, timeoutMs);
  
  res.on("finish", () => clearTimeout(timer));
  res.on("close", () => clearTimeout(timer));
  
  next();
}
