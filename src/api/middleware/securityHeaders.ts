import { Request, Response, NextFunction } from "express";

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Frame protection for API routes
  if (req.path.startsWith("/api/")) {
    res.setHeader("X-Frame-Options", "DENY");
  }
  next();
}
