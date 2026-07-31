import { Router } from "express";
import { PromptController } from "../controllers/promptController";
import { SystemController } from "../controllers/systemController";
import { RuleController } from "../controllers/ruleController";
import { requireAuth } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimit";
import { requestLogger } from "../middleware/logger";
import { validateCompileRequest, validateSessionOrPromptRequest, validateValidateRequest } from "../models/schemas";
import { requestTimeout } from "../middleware/timeout";
import { securityHeaders } from "../middleware/securityHeaders";
import { browserSessionManager } from "../session/browserSessionStore";

export function createApiRouter(): Router {
  const router = Router();
  
  const promptCtrl = new PromptController();
  const systemCtrl = new SystemController();
  const ruleCtrl = new RuleController();
  
  router.use(securityHeaders);
  router.use(requestLogger);
  
  // Public
  router.get("/health", systemCtrl.health);
  router.get("/version", systemCtrl.version);

  // Auth (Public, but manages sessions)
  router.post("/auth/session", (req, res) => {
    // If they already have a valid session, just return it.
    const cookies = req.headers.cookie || "";
    const match = cookies.match(/pf_session=([^;]+)/);
    if (match && match[1]) {
      const existing = browserSessionManager.getSession(match[1]);
      if (existing) {
        return res.json({ status: "success", session: { expiresAt: existing.expiresAt } });
      }
    }

    const session = browserSessionManager.createSession();
    // In production we should use Secure: true if we have HTTPS, but let's conditionally set it if possible or just rely on SameSite=Lax.
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("pf_session", session.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: session.expiresAt - Date.now()
    });
    res.json({ status: "success", session: { expiresAt: session.expiresAt } });
  });

  router.post("/auth/logout", (req, res) => {
    const cookies = req.headers.cookie || "";
    const match = cookies.match(/pf_session=([^;]+)/);
    if (match && match[1]) {
      browserSessionManager.deleteSession(match[1]);
    }
    res.clearCookie("pf_session", { path: "/" });
    res.json({ status: "success" });
  });
  
  // Protected
  // Note: rateLimiter and requestTimeout are applied after requireAuth
  const protectedRoute = Router();
  protectedRoute.use(requireAuth);
  protectedRoute.use(rateLimiter);
  protectedRoute.use(requestTimeout);

  protectedRoute.post("/compile", validateCompileRequest, promptCtrl.compile);
  protectedRoute.post("/optimize", validateSessionOrPromptRequest, promptCtrl.optimize);
  protectedRoute.post("/analyze", validateSessionOrPromptRequest, promptCtrl.analyze);
  protectedRoute.post("/validate", validateValidateRequest, promptCtrl.validate);
  
  protectedRoute.post("/rules/search", ruleCtrl.search);

  router.use(protectedRoute);
  
  return router;
}