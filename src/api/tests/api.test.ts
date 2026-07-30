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

  // Test 4: Compile success & Target Assistant Normalization
  const resSuccess = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({ idea: "Build a high security real-time chat application", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resSuccess.status, 200);
  assert.strictEqual(resSuccess.body.status, "success");
  assert.ok(resSuccess.body.compiledPrompt);
  assert.ok(resSuccess.body.compiledPrompt.compiledMarkdown.includes("Build a high security real-time chat application"));
  assert.ok(resSuccess.body.executionSummary);
  assert.ok(resSuccess.body.selectedRules);
  assert.ok(resSuccess.body.selectedEngines);
  assert.ok(resSuccess.body.validationResult);
  console.log("Compile success test passed.");

  // Test 5: Unknown Assistant
  const resUnknownAst = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({ idea: "Test", targetAssistant: "unknown-model-xxx" });
  assert.strictEqual(resUnknownAst.status, 400);
  console.log("Unknown Assistant test passed.");

  // Test 6: Optimize
  const resOptimize = await request(app)
    .post("/api/v1/optimize")
    .set("Authorization", "Bearer test-token")
    .send({ compiledPrompt: resSuccess.body.compiledPrompt });
  assert.strictEqual(resOptimize.status, 200);
  assert.strictEqual(resOptimize.body.status, "success");
  assert.ok(typeof resOptimize.body.originalTokens === "number");
  assert.ok(typeof resOptimize.body.optimizedTokens === "number");
  assert.ok(typeof resOptimize.body.optimizedMarkdown === "string");
  assert.ok(resOptimize.body.optimizedMarkdown.length > 0);
  assert.ok(resOptimize.body.diff);
  console.log("Optimize test passed.");

  // Test 7: Analyze
  const resAnalyze = await request(app)
    .post("/api/v1/analyze")
    .set("Authorization", "Bearer test-token")
    .send({ compiledPrompt: resSuccess.body.compiledPrompt });
  assert.strictEqual(resAnalyze.status, 200);
  assert.strictEqual(resAnalyze.body.status, "success");
  assert.ok(typeof resAnalyze.body.qualityScore === "number");
  assert.ok(typeof resAnalyze.body.completeness === "number");
  assert.ok(typeof resAnalyze.body.readability === "number");
  assert.ok(typeof resAnalyze.body.consistency === "number");
  assert.ok(typeof resAnalyze.body.efficiency === "number");

  // Secondary analysis with totally different data to ensure not constant
  const resAnalyze2 = await request(app)
    .post("/api/v1/analyze")
    .set("Authorization", "Bearer test-token")
    .send({
      compiledPrompt: {
        id: "125", title: "Diff", summary: "Diff",
        compiledMarkdown: "## Minimal\\nJust a small prompt.",
        estimatedTokens: 2000,
        sections: [
            { title: "S1", content: "...", order: 1 },
            { title: "S2", content: "...", order: 2 },
            { title: "S3", content: "...", order: 3 },
            { title: "S4", content: "...", order: 4 },
            { title: "S5", content: "...", order: 5 },
            { title: "S6", content: "...", order: 6 },
            { title: "S7", content: "...", order: 7 }
        ],
        qualityScore: 10
      }
    });
  assert.strictEqual(resAnalyze2.status, 200);
  assert.ok(resAnalyze2.body.qualityScore !== resAnalyze.body.qualityScore || resAnalyze2.body.completeness !== resAnalyze.body.completeness);
  console.log("Analyze test passed.");

  // Test 8: Validate (Valid and Invalid)
  const validPayload = {
    compiledPrompt: resSuccess.body.compiledPrompt,
    plan: { planId: "1", orderedEngines: resSuccess.body.selectedEngines, resolutionNotes: [] },
    rules: { mandatory: resSuccess.body.selectedRules, optional: [], conflictsDetected: false }
  };

  const resValA = await request(app)
    .post("/api/v1/validate")
    .set("Authorization", "Bearer test-token")
    .send(validPayload);
  assert.strictEqual(resValA.status, 200);
  assert.strictEqual(resValA.body.isValid, true);

  const invalidPayload = {
    compiledPrompt: {
      id: "124", title: "T", summary: "T",
      compiledMarkdown: "## Incomplete\\n",
      estimatedTokens: 35000, // Trigger context overflow
      sections: [
        { title: "Incomplete", content: "...", order: 1 },
      ],
      qualityScore: 90
    },
    plan: { planId: "1", orderedEngines: [], resolutionNotes: [] },
    rules: { mandatory: [{ id: "rule1", section: "Rules & Constraints", content: "...", enforcementLevel: "Strict" }], optional: [], conflictsDetected: false }
  };

  const resValB = await request(app)
    .post("/api/v1/validate")
    .set("Authorization", "Bearer test-token")
    .send(invalidPayload);
  assert.strictEqual(resValB.status, 200);
  assert.strictEqual(resValB.body.isValid, false);
  assert.ok(resValB.body.errors.length > 0);
  console.log("Validate test passed.");

  // Test 9: Error paths
  // Since we have an in-memory session from the compile request above, we can trigger the "no prompt" error by explicitly passing null
  const resOptFail = await request(app).post("/api/v1/optimize").set("Authorization", "Bearer test-token").send({ compiledPrompt: null });
  assert.strictEqual(resOptFail.status, 400);

  const resAnaFail = await request(app).post("/api/v1/analyze").set("Authorization", "Bearer test-token").send({ compiledPrompt: null });
  assert.strictEqual(resAnaFail.status, 400);

  const resValFail2 = await request(app).post("/api/v1/validate").set("Authorization", "Bearer test-token").send({ compiledPrompt: null });
  assert.strictEqual(resValFail2.status, 400);
  console.log("Error paths test passed.");

  console.log("API integration test passed successfully.");
}
runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
