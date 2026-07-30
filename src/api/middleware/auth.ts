import { Request, Response, NextFunction } from "express";
import { PromptForgeError } from "../models/errors";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"];

  if (!authHeader && !apiKey) {
    return next(new PromptForgeError(401, "UNAUTHORIZED", "Missing authentication credentials.", "Provide a valid API Key or JWT.", "Include Authorization: Bearer <token> or X-API-Key: <key> header."));
  }

  // Mock validation
  if (apiKey === "invalid-key") {
    return next(new PromptForgeError(403, "FORBIDDEN", "Invalid API Key.", "The provided key is inactive or incorrect."));
  }

  // Add mock user to request
  (req as any).user = {
    id: "user_123",
    role: "developer"
  };

  next();
}
