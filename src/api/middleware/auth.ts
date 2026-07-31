import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { browserSessionManager } from "../session/browserSessionStore";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers["x-api-key"] || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);
  const configuredKeyStr = process.env.PROMPTFORGE_API_KEY;

  if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_AUTH_FOR_DEV === 'true') {
     // Explicit development bypass
     (req as any).user = { id: "dev_user", role: "developer" };
     return next();
  }

  // 1. External API Key Auth
  if (apiKey && typeof apiKey === 'string') {
      if (!configuredKeyStr) {
        return res.status(500).json({
           status: "error",
           code: "SERVER_MISCONFIGURED",
           error: "Authentication is required but no API key is configured on the server."
        });
      }
      const validKeys = configuredKeyStr.split(',').map(k => k.trim());
      if (validKeys.includes(apiKey)) {
        const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
        (req as any).user = {
          id: `api_${hash.substring(0, 16)}`,
          role: "developer"
        };
        return next();
      }
      return res.status(403).json({
          status: "error",
          code: "FORBIDDEN",
          error: "Invalid API Key."
      });
  }

  // 2. Internal Browser Session Auth
  const cookies = req.headers.cookie || "";
  const match = cookies.match(/pf_session=([^;]+)/);
  if (match && match[1]) {
     const session = browserSessionManager.getSession(match[1]);
     if (session) {
       (req as any).user = {
         id: session.userId,
         role: "user"
       };
       return next();
     }
  }

  // 3. Unauthorized
  return res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED",
      error: "Missing authentication credentials. Include Authorization: Bearer <key> or X-API-Key: <key> header, or use a browser session."
  });
}
