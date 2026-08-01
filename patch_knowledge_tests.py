import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

import_statement = 'import { PromptKnowledgeEngine } from "../../compiler/core/knowledgeEngine";\n'
content = import_statement + content

new_tests = """
  // === PHASE 3.5: PROMPT KNOWLEDGE ENGINE TESTS ===
  console.log("Starting Prompt Knowledge Engine Tests...");
  
  const knowledgeEngine = new PromptKnowledgeEngine();
  
  // Test: Unknown prompt (Hello)
  const evalHello = knowledgeEngine.evaluate(helloRes3.ctx, helloRes3.reqs);
  assert.ok(evalHello.matchedRules.some(r => r.id === "objective_required"));
  assert.ok(evalHello.matchedRules.some(r => r.id === "audience_required"));
  assert.ok(evalHello.matchedRules.some(r => r.id === "output_format_required"));

  // Test: Explain APIs for beginners (Audience rule)
  const evalExplain = knowledgeEngine.evaluate(explainRes3.ctx, explainRes3.reqs);
  // It shouldn't trigger audience missing
  assert.ok(!evalExplain.matchedRules.some(r => r.id === "audience_required"));

  // Test: Constraint rule (Build a React application.)
  const evalReact = knowledgeEngine.evaluate(reactRes3.ctx, reactRes3.reqs);
  // React app lacks constraint text (unless explicitly passed)
  assert.ok(evalReact.matchedRules.some(r => r.id === "constraints_recommended"));

  // Test: Coding rule
  const codeCtx = { normalizedText: "build a simple app", rawInput: "build a simple app", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalCoding = knowledgeEngine.evaluate(codeCtx as any);
  assert.ok(evalCoding.matchedRules.some(r => r.id === "coding_guidelines"));

  // Test: Writing rule
  const writeCtx = { normalizedText: "write a story about a dog", rawInput: "write a story about a dog", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalWriting = knowledgeEngine.evaluate(writeCtx as any);
  assert.ok(evalWriting.matchedRules.some(r => r.id === "writing_guidelines"));

  // Test: Translation rule
  const transCtx = { normalizedText: "translate this document", rawInput: "translate this document", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalTrans = knowledgeEngine.evaluate(transCtx as any);
  assert.ok(evalTrans.matchedRules.some(r => r.id === "translation_guidelines"));

  // Test: Business rule
  const busCtx = { normalizedText: "write a marketing plan", rawInput: "write a marketing plan", language: "en", category: "General", explicitRequirements: [], implicitRequirements: [], ambiguities: [] };
  const evalBus = knowledgeEngine.evaluate(busCtx as any);
  assert.ok(evalBus.matchedRules.some(r => r.id === "business_guidelines"));

  // Test: No duplicate rules
  const ruleIds = knowledgeEngine.getRules().map(r => r.id);
  const uniqueRuleIds = new Set(ruleIds);
  assert.strictEqual(ruleIds.length, uniqueRuleIds.size);

  console.log("Prompt Knowledge Engine Tests passed.");
"""

content = content.replace('console.log("Rule Intelligence integration test passed successfully.");', new_tests + '\n  console.log("Rule Intelligence integration test passed successfully.");')

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
