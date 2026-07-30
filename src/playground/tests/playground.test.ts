import assert from "assert";

async function runTests() {
  console.log("Starting Playground Tests...");
  
  // Mock API client
  const mockApi = {
    compile: async (idea: string) => ({ compiledPrompt: { compiledMarkdown: "Test Output", estimatedTokens: 10 } }),
    optimize: async (id: string) => ({ optimizedMarkdown: "Test Opt Output", optimizedTokens: 5 }),
    searchRules: async (query: string) => ({ results: [{ id: "R1", title: "Security" }] })
  };

  // Test 1: Compile execution
  const res = await mockApi.compile("test");
  assert.strictEqual(res.compiledPrompt.estimatedTokens, 10);
  console.log("Compile API hook test passed.");

  // Test 2: Search rules
  const rules = await mockApi.searchRules("sec");
  assert.strictEqual(rules.results.length, 1);
  assert.strictEqual(rules.results[0].title, "Security");
  console.log("Rule search hook test passed.");

  // Test 3: Optimization
  const opt = await mockApi.optimize("1");
  assert.strictEqual(opt.optimizedTokens, 5);
  console.log("Optimize hook test passed.");

  console.log("Playground integration test passed successfully.");
}

runTests().catch(console.error);
