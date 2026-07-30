import { Router } from "express";
import { PromptController } from "../controllers/promptController";
import { SystemController } from "../controllers/systemController";
import { RuleController } from "../controllers/ruleController";
import { requireAuth } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimit";
import { requestLogger } from "../middleware/logger";
import { validateCompileRequest } from "../models/schemas";

export function createApiRouter(): Router {
  const router = Router();
  
  const promptCtrl = new PromptController();
  const systemCtrl = new SystemController();
  const ruleCtrl = new RuleController();

  router.use(requestLogger);
  router.use(rateLimiter);

  // Public
  router.get("/health", systemCtrl.health);
  router.get("/version", systemCtrl.version);

  // Protected
  router.post("/compile", requireAuth, validateCompileRequest, promptCtrl.compile);
  router.post("/optimize", requireAuth, promptCtrl.optimize);
  router.post("/analyze", requireAuth, promptCtrl.analyze);
  router.post("/validate", requireAuth, promptCtrl.validate);
  
  router.post("/rules/search", requireAuth, ruleCtrl.search);

  return router;
}
