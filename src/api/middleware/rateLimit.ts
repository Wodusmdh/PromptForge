import { Request, Response, NextFunction } from "express";
import { PromptForgeError } from "../models/errors";

const rateLimits = new Map<string, { count: number, resetAt: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Use authenticated user ID if available, otherwise IP
  const id = (req as any).user?.id || req.ip || "unknown";
  
  const now = Date.now();
  const windowMs = Number(process.env.PROMPTFORGE_RATE_LIMIT_WINDOW_MS) || 60000;
  const maxRequests = Number(process.env.PROMPTFORGE_RATE_LIMIT_MAX_REQUESTS) || 100;
  
  let record = rateLimits.get(id);
  
  if (!record || record.resetAt <= now) {
    record = { count: 0, resetAt: now + windowMs };
  }
  
  record.count++;
  rateLimits.set(id, record);
  
  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
  res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));
  
  if (record.count > maxRequests) {
    return next(new PromptForgeError(429, "RATE_LIMIT_EXCEEDED", "Too many requests.", "You have exceeded the rate limit.", "Wait for the rate limit window to reset."));
  }
  
  next();
}
