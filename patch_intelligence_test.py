import sys
import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

new_tests = """
  // === PHASE 2: INTELLIGENCE CORE REGRESSION TESTS ===
  console.log("Starting Intelligence Core Regression Tests...");
  const { IntentAnalyzer } = require("../../compiler/core/intentAnalyzer");
  const { RequirementExtractor } = require("../../compiler/core/requirementExtractor");
  const { RequestParser } = require("../../compiler/core/requestParser");

  const reqParser = new RequestParser();
  const intentAnalyzer = new IntentAnalyzer();
  const reqExtractor = new RequirementExtractor();

  async function testIntelligence(idea, additionalRules) {
    const userReq = {
      idea,
      additionalRules,
      targetAssistant: "gemini-ai-studio",
      complexity: "Medium",
      stack: "None",
      architectureStyle: "None",
      uiStyle: "None",
      dbType: "None",
      securityLevel: "Standard"
    };
    const ctx = await reqParser.parse(userReq);
    const intent = await intentAnalyzer.analyze(ctx);
    const reqs = await reqExtractor.extract(ctx, intent);
    return { intent, reqs };
  }

  // Test 1: General
  const res1 = await testIntelligence("Hello", "");
  assert.strictEqual(res1.intent.primary.intent, "Unknown"); // or General, let's allow what we coded
  
  // Test 2: Mathematics
  const res2 = await testIntelligence("What is 2 + 2?", "");
  assert.strictEqual(res2.intent.primary.intent, "Mathematics");
  
  // Test 3: Education (Explanation)
  const res3 = await testIntelligence("Explain APIs to beginners.", "");
  assert.strictEqual(res3.intent.primary.intent, "Education");
  const reqs3 = res3.reqs.nodes.map(n => n.description.toLowerCase());
  assert.ok(reqs3.some(r => r.includes("jargon") || r.includes("simple")));
  assert.ok(!reqs3.some(r => r.includes("react")));
  
  // Test 4: Coding
  const res4 = await testIntelligence("Build a React application.", "");
  assert.strictEqual(res4.intent.primary.intent, "Coding");
  // Test 5: Translation
  const res5 = await testIntelligence("Translate this into Japanese.", "");
  assert.strictEqual(res5.intent.primary.intent, "Translation");
  
  // Test 6: Writing
  const res6 = await testIntelligence("Write a horror story.", "");
  assert.strictEqual(res6.intent.primary.intent, "Writing");

  console.log("Intelligence Core Regression Tests passed.");
"""

content = content.replace('console.log("Rule Intelligence integration test passed successfully.");', new_tests + '\n  console.log("Rule Intelligence integration test passed successfully.");')

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
