import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = Math.random().toString(36).substring(7);
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms [ReqID: ${requestId}]`);
  });

  next();
}
