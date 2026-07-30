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

  // Test 4: Compile success
  const resSuccess = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({ idea: "Build an app", targetAssistant: "gemini", complexity: "Small", stack: "React" });
  assert.strictEqual(resSuccess.status, 200);
  assert.strictEqual(resSuccess.body.status, "success");
  console.log("Compile success test passed.");

  console.log("API integration test passed successfully.");
}

runTests().catch(console.error);
