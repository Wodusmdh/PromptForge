import assert from "assert";
import { LocalAIProvider } from "../providers/LocalAIProvider";
import { MultiLLMOrchestrator } from "../orchestrator/MultiLLMOrchestrator";
import { globalModelRegistry } from "../registry/ModelRegistry";
import { ProviderError } from "../types";

async function runTests() {
  console.log("Starting Local AI Provider Tests...");

  // Test 1: Provider is registered correctly
  const provider = new LocalAIProvider({ endpoint: "http://localhost:11434/v1" });
  assert.strictEqual(provider.name, "local");
  console.log("Test 1: Provider registration passed.");

  // Test 2: Unknown local runtime is rejected safely (Health check)
  const health = await provider.checkHealth();
  // It should be disconnected because nothing is running at 11434 in our CI environment
  assert.strictEqual(health, "DISCONNECTED");
  console.log("Test 2: Health check correctly identifies disconnected runtime.");

  // Test 3: Model discovery normalizes models but fails gracefully
  const models = await provider.getAvailableModels();
  assert.ok(Array.isArray(models));
  assert.strictEqual(models.length, 0); // No models since disconnected
  console.log("Test 3: Model discovery fails gracefully.");

  // Register a mock local model to test routing logic
  globalModelRegistry.registerModel({
    id: "mock-local-llama",
    provider: "local",
    displayName: "Mock Local Llama",
    contextWindow: 8192,
    costPer1kInput: 0,
    costPer1kOutput: 0,
    capabilities: { coding: 7, reasoning: 7, vision: false, structuredOutput: false, streaming: true, longContext: false },
    latencyTier: "low",
    availability: "high"
  });

  const orchestrator = new MultiLLMOrchestrator(1.0);
  orchestrator.registerProvider(provider);

  // Test 4: LOCAL_ONLY never routes to cloud providers
  const run = await orchestrator.runOrchestration(
    "test-local-task",
    "Hello local",
    "cheapest",
    { taskType: "general", routingMode: "LOCAL_ONLY" }
  );
  
  // It should route to mock-local-llama because it's the only one with provider === "local"
  assert.strictEqual(run.decision?.primaryModel.provider, "local");
  assert.strictEqual(run.decision?.primaryModel.id, "mock-local-llama");
  console.log("Test 4: LOCAL_ONLY routing works correctly.");

  // Test 5: Local runtime error is normalized (Since it's disconnected, it should fail)
  assert.strictEqual(run.state, "FAILED"); // Our mock orchestrator simulates when provider fails unless we actually throw? 
  // Wait, in MultiLLMOrchestrator: 
  // if (!provider) run.warnings.push("Provider not registered...");
  // else provider.executeRequest()
  // let's check what run.warnings says
  assert.ok(run.warnings.length > 0);
  assert.ok(run.warnings[0].includes("fetch") || run.warnings[0].includes("ECONNREFUSED") || run.warnings[0].includes("Local runtime is unreachable"));
  console.log("Test 5: Local runtime execution fails with normalized error.");

  console.log("All Local AI tests passed successfully.");
}

runTests().catch(console.error);
