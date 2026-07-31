import os

# 1. Update src/api/middleware/logger.ts
logger_ts = """import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  let requestId = req.headers["x-request-id"];
  
  if (!requestId || typeof requestId !== "string" || !/^[a-zA-Z0-9-]{10,100}$/.test(requestId)) {
    requestId = crypto.randomUUID();
  }
  
  res.setHeader("X-Request-ID", requestId);
  (req as any).requestId = requestId;
  
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms [ReqID: ${requestId}]`);
  });
  
  next();
}
"""
with open('src/api/middleware/logger.ts', 'w') as f:
    f.write(logger_ts)

# 2. Update src/api/middleware/rateLimit.ts
rateLimit_ts = """import { Request, Response, NextFunction } from "express";
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
"""
with open('src/api/middleware/rateLimit.ts', 'w') as f:
    f.write(rateLimit_ts)

# 3. Create src/api/middleware/timeout.ts
timeout_ts = """import { Request, Response, NextFunction } from "express";
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
"""
with open('src/api/middleware/timeout.ts', 'w') as f:
    f.write(timeout_ts)

# 4. Create src/api/middleware/securityHeaders.ts
security_ts = """import { Request, Response, NextFunction } from "express";

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Frame protection for API routes
  if (req.path.startsWith("/api/")) {
    res.setHeader("X-Frame-Options", "DENY");
  }
  next();
}
"""
with open('src/api/middleware/securityHeaders.ts', 'w') as f:
    f.write(security_ts)
