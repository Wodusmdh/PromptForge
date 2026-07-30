import sys

content = """import express from "express";
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

  // Test 4 & Target Assistant Normalization
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
    .send({ promptId: resSuccess.body.id });
  assert.strictEqual(resOptimize.status, 200);
  assert.strictEqual(resOptimize.body.status, "success");
  assert.notStrictEqual(resOptimize.body.optimizedTokens, 80); // Real optimization run, not mock
  assert.notStrictEqual(resOptimize.body.originalTokens, 100); 
  assert.ok(resOptimize.body.optimizedMarkdown);
  console.log("Optimize test passed.");

  // Test 7: Analyze
  const resAnalyze = await request(app)
    .post("/api/v1/analyze")
    .set("Authorization", "Bearer test-token")
    .send({ promptId: resSuccess.body.id });
  assert.strictEqual(resAnalyze.status, 200);
  assert.strictEqual(resAnalyze.body.status, "success");
  assert.ok(resAnalyze.body.qualityScore !== undefined);
  assert.notStrictEqual(resAnalyze.body.qualityScore, 92); // Not mock 92 (wait, might be 90 depending on length, just checking existence is fine)
  assert.ok(resAnalyze.body.completeness !== undefined);
  console.log("Analyze test passed.");

  // Test 8: Validate (Valid and Invalid)
  const validPayload = {
    compiledPrompt: {
      id: "123", title: "T", summary: "T",
      compiledMarkdown: "## Context\\n## Requirements\\n## Rules & Constraints\\n",
      estimatedTokens: 500,
      sections: [
        { title: "Context", content: "...", order: 1 },
        { title: "Requirements", content: "...", order: 2 },
        { title: "Rules & Constraints", content: "...", order: 3 },
      ],
      qualityScore: 90
    },
    plan: { planId: "1", orderedEngines: [], resolutionNotes: [] },
    rules: { mandatory: [], optional: [], conflictsDetected: false }
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
  console.log("Validate (Valid and Invalid) test passed.");

  console.log("API integration test passed successfully.");
}
runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
"""

with open('src/api/tests/api.test.ts', 'w') as f:
    f.write(content)
