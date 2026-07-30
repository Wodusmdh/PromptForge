import { DependencyResolver } from "../core/resolver";
import { PluginRegistry } from "../core/registry";
import { EventSystem } from "../core/events";
import { SecuritySandbox } from "../security/sandbox";
import { EngineLifecycleManager } from "../core/lifecycle";
import { CustomFeatureEngine } from "../example/customEngine";
import { IExecutionContext } from "../../runtime/models/types";
import assert from "assert";

async function runTests() {
  console.log("Starting SDK Plugin Tests...");

  // 1. Dependency Resolution
  const resolver = new DependencyResolver();
  const registry = new PluginRegistry(resolver);
  
  const customEngine = new CustomFeatureEngine();
  registry.register(customEngine);
  
  const order = registry.getEnabledOrdered();
  assert.strictEqual(order.length, 1);
  assert.strictEqual(order[0].metadata.id, "engine-custom-feature");

  // 2. Lifecycle & Events
  const events = new EventSystem();
  let executionCount = 0;
  events.on("afterExecution", () => executionCount++);

  const sandbox = new SecuritySandbox();
  const lifecycle = new EngineLifecycleManager(events, sandbox);

  // Mock Context
  const context = {
    request: { idea: "Build an analytics dashboard" },
    rules: { mandatory: [], optional: [], conflictsDetected: false },
    selectedEngines: [],
    intermediateOutputs: {},
    status: "running",
    tokenBudget: 1000
  } as unknown as IExecutionContext;

  const result = await lifecycle.runLifecycle(customEngine, context);
  
  assert.strictEqual(executionCount, 1);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].title, "Analytics Tracking");

  console.log("SDK integration test passed successfully.");
}

runTests().catch(console.error);
