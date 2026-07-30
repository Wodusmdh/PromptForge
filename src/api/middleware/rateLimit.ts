import { Request, Response, NextFunction } from "express";
import { PromptForgeError } from "../models/errors";

const rateLimits = new Map<string, { count: number, resetAt: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;

  let record = rateLimits.get(ip);
  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + windowMs };
  }

  record.count++;
  rateLimits.set(ip, record);

  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - record.count));
  res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));

  if (record.count > maxRequests) {
    return next(new PromptForgeError(429, "RATE_LIMIT_EXCEEDED", "Too many requests.", "You have exceeded the burst protection limit.", "Wait for the rate limit window to reset."));
  }

  next();
}
