import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

new_tests = """
  // === PHASE 2.2: REASONING ENGINE TESTS ===
  console.log("Starting Reasoning Engine Tests...");

  // Test: Hello
  const helloRes = await testIntelligence("Hello", "");
  const acceptedHello = helloRes.reqs.nodes.filter(n => n.status === "Accepted");
  assert.strictEqual(acceptedHello.length, 0);

  // Test: Explain APIs for beginners
  const explainRes = await testIntelligence("Explain APIs for beginners.", "");
  const simpleReq = explainRes.reqs.nodes.find(n => n.text === "Avoid jargon and explain terminology" && n.status === "Accepted");
  const examplesReq = explainRes.reqs.nodes.find(n => n.text === "Provide simple examples" && n.status === "Accepted");
  const reactReq = explainRes.reqs.nodes.find(n => n.text === "Use React.");
  
  assert.ok(simpleReq);
  assert.ok(examplesReq);
  assert.ok(!reactReq || reactReq.status === "Rejected");
  assert.strictEqual(simpleReq.evidence, "beginner");
  assert.strictEqual(simpleReq.origin, "Implicit");

  // Test: Use React.
  const reactRes2 = await testIntelligence("Build a website.", "- Use React.");
  const explicitReact2 = reactRes2.reqs.nodes.find(n => n.text === "Use React." && n.status === "Accepted");
  assert.ok(explicitReact2);
  assert.strictEqual(explicitReact2.origin, "Explicit");

  // Test: Build ecommerce website.
  const ecomRes = await testIntelligence("Build an ecommerce website.", "");
  const missingPlatform = ecomRes.reqs.nodes.find(n => n.text === "Platform" && n.status === "Missing Information");
  assert.ok(missingPlatform);
  assert.strictEqual(missingPlatform.origin, "Optional");

  // Test: Conflicting instructions.
  const conflictRes2 = await testIntelligence("App", "- Use React.\\n- Do not use React.");
  const confNode = conflictRes2.reqs.nodes.find(n => n.text === "Use React.");
  assert.ok(confNode);
  assert.strictEqual(confNode.status, "Conflict");

  console.log("Reasoning Engine Tests passed.");
"""

content = content.replace('console.log("Requirement Scoring Engine Tests passed.");', 'console.log("Requirement Scoring Engine Tests passed.");\n' + new_tests)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
