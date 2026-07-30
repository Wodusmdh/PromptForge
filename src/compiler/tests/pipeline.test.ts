import { UserRequestSchema } from "../models/schemas";
import { RequestParser } from "../core/parser";
import { RuleRegistry } from "../rules/registry";
import { StaticRuleLoader } from "../rules/loader";
import { EngineRegistry } from "../engines/registry";
import { IEngine, IEngineContext } from "../engines/interface";
import { CompilerPipeline } from "../core/pipeline";
import assert from "assert";

async function runTests() {
  console.log("Starting Compiler Phase 1 Tests...");

  // 1. Test Data Model Validation
  console.log("Testing Data Models...");
  const validRequest = {
    idea: "Build a chat app",
    targetAssistant: "cursor-claude",
    complexity: "Medium",
    stack: "React + Node",
    architectureStyle: "Modular Monolith",
    uiStyle: "Modern Minimalist",
    dbType: "PostgreSQL",
    securityLevel: "Standard"
  };
  
  const parsed = UserRequestSchema.parse(validRequest);
  assert.strictEqual(parsed.idea, "Build a chat app");
  assert.ok(parsed.timestamp);

  // 2. Test Rule Loading & Registry
  console.log("Testing Rule Loading...");
  const ruleRegistry = new RuleRegistry();
  const loader = new StaticRuleLoader();
  const rules = await loader.load();
  
  rules.forEach(r => ruleRegistry.register(r));
  const retrieved = ruleRegistry.getRule("rule-1");
  assert.ok(retrieved);
  assert.strictEqual(retrieved?.section, "39.3");

  const deps = ruleRegistry.resolveDependencies("rule-2");
  assert.strictEqual(deps.length, 1);
  assert.strictEqual(deps[0].id, "rule-1");

  // 3. Test Engine Registration
  console.log("Testing Engine Registration...");
  const engineRegistry = new EngineRegistry();
  
  class DummyEngine implements IEngine {
    definition = {
      id: "engine-dummy",
      name: "Dummy Engine",
      type: "Generator" as const,
      dependencies: []
    };
    shouldRun(context: IEngineContext) { return true; }
    async execute(context: IEngineContext) { return []; }
  }
  
  const dummyEngine = new DummyEngine();
  engineRegistry.register(dummyEngine);
  assert.ok(engineRegistry.getEngine("engine-dummy"));

  // 4. Test Pipeline Execution Plan
  console.log("Testing Pipeline Plan Generation...");
  const pipeline = new CompilerPipeline(engineRegistry, ruleRegistry);
  const { plan, context } = await pipeline.createExecutionPlan(validRequest);
  
  assert.strictEqual(plan.status, "Pending");
  assert.ok(plan.stages.length > 0);
  assert.strictEqual(plan.stages[0][0].id, "engine-dummy");
  
  console.log("All Phase 1 tests passed successfully!");
}

runTests().catch(console.error);
