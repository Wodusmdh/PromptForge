import sys

with open('src/api/middleware/auth.ts', 'r') as f:
    content = f.read()

replacement = """import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"] || (authHeader ? authHeader.replace(/^Bearer\\s+/i, '') : null);

  const configuredKey = process.env.PROMPTFORGE_API_KEY;

  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_AUTH_FOR_DEV === 'true') {
     // Explicit development bypass
     (req as any).user = { id: "dev_user", role: "developer" };
     return next();
  }

  if (!configuredKey) {
    return res.status(500).json({
       status: "error",
       code: "SERVER_MISCONFIGURED",
       error: "Authentication is required but no API key is configured on the server."
    });
  }

  if (!apiKey) {
    return res.status(401).json({
        status: "error",
        code: "UNAUTHORIZED",
        error: "Missing authentication credentials. Include Authorization: Bearer <key> or X-API-Key: <key> header."
    });
  }

  if (apiKey !== configuredKey) {
    return res.status(403).json({
        status: "error",
        code: "FORBIDDEN",
        error: "Invalid API Key."
    });
  }

  (req as any).user = {
    id: "authenticated_user",
    role: "developer"
  };

  next();
}
"""

with open('src/api/middleware/auth.ts', 'w') as f:
    f.write(replacement)
