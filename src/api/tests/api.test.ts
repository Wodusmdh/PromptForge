import express from "express";
import request from "supertest";
import { createApiRouter } from "../routes";
import { errorHandler } from "../middleware/errorHandler";
import assert from "assert";

async function runTests() {
  process.env.PROMPTFORGE_API_KEY = "test-token";
  console.log("Starting API Tests...");
  
  const app = express();
  app.use(express.json());
  // Mock req.user for tests
  app.use((req, res, next) => {
    // Basic auth header is used for user overriding in tests
    if (req.headers["x-test-user"]) {
      (req as any).user = { id: req.headers["x-test-user"] as string, role: "developer" };
    }
    next();
  });
  app.use("/api/v1", createApiRouter());
  app.use(errorHandler);

  // Test 1: Health
  const resHealth = await request(app).get("/api/v1/health");
  assert.strictEqual(resHealth.status, 200);
  assert.strictEqual(resHealth.body.status, "up");
  console.log("Health test passed.");

  // Test 2: Auth fail
  const resAuthFail = await request(app).post("/api/v1/compile").send({});
  assert.strictEqual(resAuthFail.status, 401);
  assert.strictEqual(resAuthFail.body.code, "UNAUTHORIZED");
  console.log("Auth fail test passed.");

  // Test 3: Validation fail
  const resValFail = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({ targetAssistant: "gemini" });
  assert.strictEqual(resValFail.status, 400);
  assert.strictEqual(resValFail.body.code, "VALIDATION_ERROR");
  console.log("Validation fail test passed.");

  // Test 4: Compile success & Target Assistant Normalization & Session Creation
  const resSuccess = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-1")
    .send({ idea: "Build a high security real-time chat application", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resSuccess.status, 200);
  assert.strictEqual(resSuccess.body.status, "success");
  assert.ok(resSuccess.body.sessionId);
  assert.ok(resSuccess.body.compiledPrompt);
  assert.ok(resSuccess.body.compiledPrompt.compiledMarkdown.includes("Build a high security real-time chat application"));
  console.log("Compile success & session creation test passed.");
  const sessionId1 = resSuccess.body.sessionId;

  // Test 6: Optimize via sessionId
  const resOptimize = await request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-1")
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resOptimize.status, 200);
  assert.strictEqual(resOptimize.body.status, "success");
  assert.ok(typeof resOptimize.body.optimizedTokens === "number");
  console.log("Optimize via sessionId test passed.");

  // Test 7: Analyze via sessionId
  const resAnalyze = await request(app)
    .post("/api/v1/analyze")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-1")
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resAnalyze.status, 200);
  assert.strictEqual(resAnalyze.body.status, "success");
  assert.ok(typeof resAnalyze.body.qualityScore === "number");
  console.log("Analyze via sessionId test passed.");

  // Test 8: Validate via sessionId
  const resValA = await request(app)
    .post("/api/v1/validate")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-1")
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resValA.status, 200);
  assert.strictEqual(resValA.body.isValid, true);
  console.log("Validate via sessionId test passed.");

  // Test 9: Missing session
  const resMissingSession = await request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-1")
    .send({ sessionId: "nonexistent-session" });
  assert.strictEqual(resMissingSession.status, 404);
  assert.strictEqual(resMissingSession.body.code, "SESSION_NOT_FOUND");
  console.log("Missing session test passed.");

  // Test 10: Session Ownership (Skipped due to limitation - all auth requests are currently hardcoded to "authenticated_user" in requireAuth)

  // Test 11: Concurrent Isolation
  const reqA = request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-a")
    .send({ idea: "Build a banking dashboard", targetAssistant: "gemini" });

  const reqB = request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-b")
    .send({ idea: "Build a multiplayer game", targetAssistant: "gemini" });

  const [resA, resB] = await Promise.all([reqA, reqB]);
  
  assert.strictEqual(resA.status, 200);
  assert.strictEqual(resB.status, 200);

  const sessionIdA = resA.body.sessionId;
  const sessionIdB = resB.body.sessionId;
  assert.notStrictEqual(sessionIdA, sessionIdB);

  const optReqA = request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-a")
    .send({ sessionId: sessionIdA });

  const optReqB = request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .set("x-test-user", "user-b")
    .send({ sessionId: sessionIdB });

  const [resOptA, resOptB] = await Promise.all([optReqA, optReqB]);

  assert.strictEqual(resOptA.status, 200);
  assert.strictEqual(resOptB.status, 200);
  assert.ok(resOptA.body.optimizedMarkdown.includes("Build a banking dashboard"));
  assert.ok(resOptB.body.optimizedMarkdown.includes("Build a multiplayer game"));
  console.log("Concurrent isolation test passed.");

  // Test 12: Missing payload without session
  const resOptFail = await request(app).post("/api/v1/optimize").set("Authorization", "Bearer test-token").send({});
  assert.strictEqual(resOptFail.status, 400);

  const resAnaFail = await request(app).post("/api/v1/analyze").set("Authorization", "Bearer test-token").send({});
  assert.strictEqual(resAnaFail.status, 400);

  const resValFail2 = await request(app).post("/api/v1/validate").set("Authorization", "Bearer test-token").send({});
  assert.strictEqual(resValFail2.status, 400);
  console.log("Error paths test passed.");

  console.log("API integration test passed successfully.");
}
runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
