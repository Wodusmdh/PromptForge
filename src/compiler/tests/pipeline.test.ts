import { UserRequestSchema } from "../models/schemas";
import { RequestParser } from "../core/parser";
import { RuleRegistry } from "../rules/registry";
import { StaticRuleLoader } from "../rules/loader";
import { EngineRegistry } from "../engines/registry";
import { IEngine, IEngineContext } from "../engines/interface";
import { CompilerPipeline } from "../core/pipeline";
import { RequirementExtractor } from "../core/requirementExtractor";
import { RequestContext, IntentGraph } from "../models/domain";
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

  // 5. Test Name: should strictly extract only requested requirements and ignore default hallucinated requirements
  console.log("Testing: should strictly extract only requested requirements and ignore default hallucinated requirements...");
  const extractor = new RequirementExtractor();
  const simplePrompt = "Create a simple function that adds two numbers.";
  const mockContext: RequestContext = {
    rawInput: simplePrompt,
    normalizedText: simplePrompt.toLowerCase(),
    language: "en",
    category: "General application",
    explicitRequirements: [],
    implicitRequirements: ["Must adhere to standard coding conventions", "Requires appropriate error handling"],
    ambiguities: []
  };
  const mockIntent: IntentGraph = {
    primary: {
      id: "1",
      type: "primary",
      intent: "Coding",
      description: "Coding function",
      confidence: 1.0
    },
    secondary: [],
    complexityEstimation: 1
  };

  const reqGraph = await extractor.extract(mockContext, mockIntent);
  const acceptedRequirements = reqGraph.nodes.filter(r => r.status === "Accepted" || r.status === "accepted");

  // Assertion 1: Ensure the output requirements array length is exactly 1 (or corresponding only to the addition logic)
  assert.strictEqual(acceptedRequirements.length, 1, "Output requirements length should be exactly 1");

  // Assertion 2: Explicitly check that requirements.some(r => r.description.includes('Error handling')) is FALSE
  assert.strictEqual(acceptedRequirements.some(r => r.description.includes('Error handling')), false, "Error handling should not be present");

  // Assertion 3: Explicitly check that requirements.some(r => r.description.includes('Coding conventions')) is FALSE
  assert.strictEqual(acceptedRequirements.some(r => r.description.includes('Coding conventions')), false, "Coding conventions should not be present");

  console.log("All Phase 1 tests passed successfully!");
}

runTests().catch(console.error);
