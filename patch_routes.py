import sys

with open('src/api/routes/index.ts', 'r') as f:
    content = f.read()

content = content.replace(
"""import { validateCompileRequest } from "../models/schemas";""",
"""import { validateCompileRequest, validateSessionOrPromptRequest, validateValidateRequest } from "../models/schemas";
import { requestTimeout } from "../middleware/timeout";
import { securityHeaders } from "../middleware/securityHeaders";"""
)

# Replace the router part
new_router = """export function createApiRouter(): Router {
  const router = Router();
  
  const promptCtrl = new PromptController();
  const systemCtrl = new SystemController();
  const ruleCtrl = new RuleController();
  
  router.use(securityHeaders);
  router.use(requestLogger);
  
  // Public
  router.get("/health", systemCtrl.health);
  router.get("/version", systemCtrl.version);
  
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
}"""

import re
content = re.sub(r'export function createApiRouter\(\): Router \{.*\}', new_router, content, flags=re.DOTALL)

with open('src/api/routes/index.ts', 'w') as f:
    f.write(content)
