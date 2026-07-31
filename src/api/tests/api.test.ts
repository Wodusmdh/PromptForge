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

  // Test B1: Session auth creation
  const resSession = await request(app).post("/api/v1/auth/session");
  assert.strictEqual(resSession.status, 200);
  const cookie = resSession.headers["set-cookie"][0];
  assert.ok(cookie.includes("pf_session="));
  assert.ok(cookie.includes("HttpOnly"));
  console.log("Session creation test passed.");

  // Test B2: Session auth usage
  const resSessionCompile = await request(app)
    .post("/api/v1/compile")
    .set("Cookie", cookie)
    .send({ idea: "Build a test app", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resSessionCompile.status, 200);
  assert.ok(resSessionCompile.body.sessionId);
  console.log("Session usage test passed.");

  // Test B3: Unknown session auth usage
  const resUnknownSession = await request(app)
    .post("/api/v1/compile")
    .set("Cookie", "pf_session=unknown-random-session")
    .send({ idea: "Build a test app", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resUnknownSession.status, 401);
  console.log("Unknown session usage test passed.");

  // Test B4: Logout
  const resLogout = await request(app)
    .post("/api/v1/auth/logout")
    .set("Cookie", cookie);
  assert.strictEqual(resLogout.status, 200);

  // Use the logged out session
  const resAfterLogout = await request(app)
    .post("/api/v1/compile")
    .set("Cookie", cookie)
    .send({ idea: "Build a test app", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resAfterLogout.status, 401);
  console.log("Logout test passed.");

  // Test B5: Two different browser sessions have different execution session ownership
  const resSession2 = await request(app).post("/api/v1/auth/session");
  const cookie2 = resSession2.headers["set-cookie"][0];

  const resSession3 = await request(app).post("/api/v1/auth/session");
  const cookie3 = resSession3.headers["set-cookie"][0];

  const resCompile2 = await request(app)
    .post("/api/v1/compile")
    .set("Cookie", cookie2)
    .send({ idea: "Build a test app", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  const execSessionId = resCompile2.body.sessionId;

  const resOptimize3 = await request(app)
    .post("/api/v1/optimize")
    .set("Cookie", cookie3)
    .send({ sessionId: execSessionId });
  assert.strictEqual(resOptimize3.status, 403);
  console.log("Two browser session isolation test passed.");


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
  // Verify the rate limit headers exist on a normal request.
  assert.ok(resSuccess.header["x-ratelimit-limit"]);
  assert.ok(resSuccess.header["x-ratelimit-remaining"]);
  assert.ok(resSuccess.header["x-ratelimit-reset"]);
  console.log("Rate limit headers test passed.");

  // Test 15: Regression - Do not hallucinate requirements
  const resRegression1 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Explain what an API is to a beginner.",
      additionalRules: "- Use simple Indonesian.\n- Give one real-world analogy.\n- Explain frontend, backend, API, and database.\n- Give one small request/response example.\n- Use clear headings.\n- Do not assume prior programming knowledge."
    });

  assert.strictEqual(resRegression1.status, 200, "Regression1 compile failed");
  const markdown1 = resRegression1.body.compiledPrompt.compiledMarkdown;
  
  const forbidden1 = ["React", "Express", "Tailwind", "PostgreSQL", "Modular Monolith", "gemini-ai-studio"];
  for (const f of forbidden1) {
    if (markdown1.includes(f)) {
      throw new Error(`Regression1 failed: found forbidden string '${f}' in output.`);
    }
  }

  const required1 = ["Indonesian", "API", "frontend", "backend", "database", "request/response", "beginner", "real-world analogy", "clear headings"];
  for (const r of required1) {
    if (!markdown1.toLowerCase().includes(r.toLowerCase())) {
      throw new Error(`Regression1 failed: missing required string '${r}' in output.`);
    }
  }
  console.log("Regression test 1 passed.");

  // Test 16: Regression - Preserve explicitly provided stack
  const resRegression2 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Build a React 19 frontend with Express and PostgreSQL.",
      stack: "React 19 + Express",
      dbType: "PostgreSQL"
    });

  assert.strictEqual(resRegression2.status, 200);
  const markdown2 = resRegression2.body.compiledPrompt.compiledMarkdown;
  
  const required2 = ["React 19", "Express", "PostgreSQL"];
  for (const r of required2) {
    if (!markdown2.includes(r)) {
      throw new Error(`Regression2 failed: missing required string '${r}' in output.`);
    }
  }
  console.log("Regression test 2 passed.");

  // Test 17: Regression - Preserve explicit UI style
  const resRegression3 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Design a modern minimalist dashboard using React.",
      uiStyle: "Modern Minimalist",
      stack: "React"
    });

  assert.strictEqual(resRegression3.status, 200);
  const markdown3 = resRegression3.body.compiledPrompt.compiledMarkdown;
  
  assert.ok(markdown3.toLowerCase().includes("modern minimalist"));
  assert.ok(markdown3.toLowerCase().includes("react"));
  console.log("Regression test 3 passed.");

  // Test 18: Regression - Preserve explicit Architecture
  const resRegression4 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Create a modular monolith backend using Express and PostgreSQL.",
      architectureStyle: "Modular monolith",
      stack: "Express",
      dbType: "PostgreSQL"
    });

  assert.strictEqual(resRegression4.status, 200);
  const markdown4 = resRegression4.body.compiledPrompt.compiledMarkdown;
  
  assert.ok(markdown4.toLowerCase().includes("modular monolith"));
  assert.ok(markdown4.toLowerCase().includes("express"));
  assert.ok(markdown4.toLowerCase().includes("postgresql"));
  console.log("Regression test 4 passed.");

  console.log("API integration test passed successfully.");



}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
