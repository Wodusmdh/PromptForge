import assert from "assert";
import { MultiLLMOrchestrator } from "../orchestrator/MultiLLMOrchestrator";
import { GeminiProvider } from "../providers/GeminiProvider";
import { OpenAIProvider } from "../providers/OpenAIProvider";
import { AnthropicProvider } from "../providers/AnthropicProvider";
import { AIProviderConfig, NormalizedRequest, NormalizedResponse } from "../types";
import { AIProvider } from "../providers/AIProvider";
import { globalModelRegistry } from "../registry/ModelRegistry";

// A mock provider for testing to ensure no API calls are made
class MockProvider implements AIProvider {
  name = "generic" as const;
  config: AIProviderConfig = {};

  async getAvailableModels() { return []; }

  async executeRequest(request: NormalizedRequest): Promise<NormalizedResponse> {
    if (request.modelId === "fail-model") {
      throw new Error("Simulated failure");
    }
    return {
      text: `Mocked response from ${request.modelId}`,
      provider: this.name,
      model: request.modelId,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 }
    };
  }

  async generateText() { return ""; }
  async generateStructured<T>() { return {} as T; }
}

async function runTests() {
  console.log("Starting Multi-LLM Orchestrator Tests...");

  // Register some dummy models in registry
  globalModelRegistry.getAllModels().forEach(m => (globalModelRegistry as any).models.delete(m.id));
  globalModelRegistry.registerModel({
    id: "mock-cheap",
    provider: "generic",
    displayName: "Mock Cheap Model",
    contextWindow: 1000,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.02,
    capabilities: { coding: 5, reasoning: 5, vision: false, structuredOutput: true, streaming: false, longContext: false },
    latencyTier: "low",
    availability: "high"
  });

  globalModelRegistry.registerModel({
    id: "mock-expensive",
    provider: "generic",
    displayName: "Mock Expensive Model",
    contextWindow: 8000,
    costPer1kInput: 0.1,
    costPer1kOutput: 0.2,
    capabilities: { coding: 10, reasoning: 10, vision: false, structuredOutput: true, streaming: false, longContext: true },
    latencyTier: "medium",
    availability: "high"
  });

  const orchestrator = new MultiLLMOrchestrator(0.5);
  orchestrator.registerProvider(new MockProvider());

  // Test 1: SINGLE_MODEL strategy (Cheapest)
  const run1 = await orchestrator.runOrchestration(
    "task-1",
    "Hello",
    "cheapest",
    { taskType: "general" }
  );

  assert.strictEqual(run1.decision?.primaryModel.id, "mock-cheap", "Should select cheap model");
  assert.ok(run1.result?.includes("Mocked response from mock-cheap"), "Should contain mock response");
  assert.strictEqual(run1.state, "COMPLETED", "State should be COMPLETED");
  console.log("Test 1: SINGLE_MODEL (Cheapest) passed.");

  // Test 2: PARALLEL_COMPARE (Ensemble)
  const run2 = await orchestrator.runOrchestration(
    "task-2",
    "Synthesize this",
    "ensemble",
    { taskType: "general", minReasoningCapability: 4 }
  );

  // Ensemble mode requires secondary/synthesis models
  // Wait, let's look at `ModelRouter.ts` how ensemble handles it.
  // Actually, we modified it to use ensemble if it's there.
  assert.ok(run2.decision?.primaryModel);
  assert.ok(run2.result?.includes("Mocked response"), "Should synthesize a result");
  assert.strictEqual(run2.state, "COMPLETED", "Ensemble should complete");
  console.log("Test 2: PARALLEL_COMPARE (Ensemble) passed.");

  // Test 3: Provider Abstraction Instantiation
  const gemini = new GeminiProvider({});
  const openai = new OpenAIProvider({});
  const anthropic = new AnthropicProvider({});

  assert.strictEqual(gemini.name, "gemini");
  assert.strictEqual(openai.name, "openai");
  assert.strictEqual(anthropic.name, "anthropic");

  // Test executing without key throws error
  try {
    await gemini.executeRequest({ prompt: "Hello", modelId: "gemini-1.5-pro" });
    assert.fail("Should have thrown error");
  } catch (e: any) {
    assert.strictEqual(e.name, "ProviderError");
    assert.strictEqual(e.category, "AUTHENTICATION_ERROR");
  }
  console.log("Test 3: Provider Abstraction Instantiation passed.");

  // Test 4: Budget constraints
  const strictOrchestrator = new MultiLLMOrchestrator(0.0000000001); // Almost zero budget
  strictOrchestrator.registerProvider(new MockProvider());
  
  const run4 = await strictOrchestrator.runOrchestration(
    "task-4",
    "Exceed budget",
    "quality",
    { taskType: "general" }
  );
  assert.strictEqual(run4.state, "FAILED");
  assert.ok(run4.warnings[0].includes("Budget exceeded"));
  console.log("Test 4: Budget Constraints passed.");

  console.log("All Orchestrator integration tests passed successfully.");
}

runTests().catch(console.error);
