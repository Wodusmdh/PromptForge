import crypto from "crypto";
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
