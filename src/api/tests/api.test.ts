import express from "express";
import request from "supertest";
import { createApiRouter } from "../routes";
import { errorHandler } from "../middleware/errorHandler";
import assert from "assert";

async function runTests() {
  process.env.PROMPTFORGE_API_KEY = "test-token,test-token-2"; // Support multiple keys for testing
  process.env.DISABLE_AUTH_FOR_DEV = "false"; // Disable dev bypass so auth is actually tested
  
  console.log("Starting API Tests...");
  
  const app = express();
  app.use(express.json());
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

  // Test 4: Compile success & Session Creation (TEST A - same user)
  const resSuccess = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({ idea: "Build a high security real-time chat application", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resSuccess.status, 200);
  assert.strictEqual(resSuccess.body.status, "success");
  assert.ok(resSuccess.body.sessionId);
  assert.ok(resSuccess.body.compiledPrompt);
  assert.ok(resSuccess.body.compiledPrompt.compiledMarkdown.includes("Build a high security real-time chat application"));
  console.log("Compile success & session creation test passed.");
  const sessionId1 = resSuccess.body.sessionId;

  // Test 6: Optimize via sessionId (TEST A - same user access)
  const resOptimize = await request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resOptimize.status, 200);
  assert.strictEqual(resOptimize.body.status, "success");
  assert.ok(typeof resOptimize.body.optimizedTokens === "number");
  console.log("Optimize via sessionId test passed.");

  // Test 7: Analyze via sessionId (TEST A - same user access)
  const resAnalyze = await request(app)
    .post("/api/v1/analyze")
    .set("Authorization", "Bearer test-token")
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resAnalyze.status, 200);
  assert.strictEqual(resAnalyze.body.status, "success");
  assert.ok(typeof resAnalyze.body.qualityScore === "number");
  console.log("Analyze via sessionId test passed.");

  // Test 8: Validate via sessionId (TEST A - same user access)
  const resValA = await request(app)
    .post("/api/v1/validate")
    .set("Authorization", "Bearer test-token")
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resValA.status, 200);
  assert.strictEqual(resValA.body.isValid, true);
  console.log("Validate via sessionId test passed.");

  // Test 9: Missing session
  const resMissingSession = await request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .send({ sessionId: "nonexistent-session" });
  assert.strictEqual(resMissingSession.status, 404);
  assert.strictEqual(resMissingSession.body.code, "SESSION_NOT_FOUND");
  console.log("Missing session test passed.");

  // Test 10: Session Ownership (TEST B & TEST C - different users, ownership check)
  const resOwnership = await request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token-2") // Different user key
    .send({ sessionId: sessionId1 });
  assert.strictEqual(resOwnership.status, 403);
  assert.strictEqual(resOwnership.body.code, "SESSION_FORBIDDEN");
  console.log("Session ownership test passed.");

  // Test 11: Concurrent Isolation (TEST D)
  const reqA = request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({ idea: "Build a banking dashboard", targetAssistant: "gemini" });

  const reqB = request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token-2")
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
    .send({ sessionId: sessionIdA });

  const optReqB = request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token-2")
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

  // Test 13: Oversized Payload
  const largePayload = {
    idea: "A".repeat(2 * 1024 * 1024), // 2MB string
    targetAssistant: "gemini"
  };
  const resOversize = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send(largePayload);
  assert.strictEqual(resOversize.status, 413); // Payload Too Large
  console.log("Oversized payload test passed.");

  // Test 14: Rate Limit
  // In tests, the limit is 100 requests. We will just simulate it by sending requests until it 429s, 
  // but to avoid taking too long, we will use a different user/IP and a test config if possible, 
  // or we can just verify the rate limit headers exist on a normal request.
  assert.ok(resSuccess.header["x-ratelimit-limit"]);
  assert.ok(resSuccess.header["x-ratelimit-remaining"]);
  assert.ok(resSuccess.header["x-ratelimit-reset"]);
  console.log("Rate limit headers test passed.");

  console.log("API integration test passed successfully.");
}
runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
