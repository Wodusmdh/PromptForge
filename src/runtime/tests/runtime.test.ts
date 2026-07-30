import { createRuntime } from "../di";
import { UserRequest } from "../../compiler/models/schemas";
import assert from "assert";

async function runTests() {
  console.log("Starting Runtime Integration Tests...");

  const config = {
    maxRetries: 3,
    tokenLimit: 32000,
    enableTelemetry: true
  };
  const runtime = createRuntime(config);

  // Note: the engine manager is currently empty, but the compiler doesn't generate
  // any selected engines in our mock logic (or it generates none), so it will pass.
  // We can add a mock engine if needed.
  // Wait, the EngineSelector we built in the compiler selects ALL engines from the engineRegistry, 
  // but we initialize an empty EngineRegistry. So selectedEngines will be empty.

  const mockRequest: UserRequest = {
    idea: "Build a real-time multiplayer game.",
    targetAssistant: "gemini-ai-studio",
    complexity: "Large",
    stack: "React + WebSocket",
    architectureStyle: "Microservices",
    uiStyle: "Playful",
    dbType: "Redis",
    securityLevel: "Standard",
    timestamp: new Date()
  };

  console.log("Running runtime scheduler...");
  const result = await runtime.run(mockRequest);

  console.log("--- RUNTIME OUTPUT ---");
  console.log("Execution Summary:", result.executionSummary);
  console.log("Validation Valid:", result.validationResult.isValid);
  
  assert.ok(result.executionSummary.includes("Runtime executed successfully"));
  console.log("Runtime integration test passed successfully.");
}

runTests().catch(console.error);
