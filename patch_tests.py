import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

new_tests = """
  // === PHASE 2.1: REQUIREMENT SCORING ENGINE TESTS ===
  console.log("Starting Requirement Scoring Engine Tests...");
  
  // Test: Duplicate requirements
  const dupRes = await testIntelligence("I want a dark theme. Use dark mode. Make the dark ui.", "");
  const darkReq = dupRes.reqs.nodes.find(n => n.text === "Use dark mode");
  assert.ok(darkReq);
  // It should be deduplicated
  assert.strictEqual(darkReq.duplicateCount > 1, true);
  assert.strictEqual(dupRes.reqs.metrics.duplicateCount > 0, true);

  // Test: Contradictory requirements
  const conflictRes = await testIntelligence("Use React.", "Do not use React.");
  const reactConf = conflictRes.reqs.nodes.find(n => n.text === "Use React.");
  const noReactConf = conflictRes.reqs.nodes.find(n => n.text === "Do not use React.");
  assert.ok(reactConf);
  assert.ok(noReactConf);
  assert.strictEqual(reactConf.status, "needs user clarification");
  assert.strictEqual(noReactConf.status, "needs user clarification");
  assert.strictEqual(conflictRes.reqs.metrics.conflictCount > 0, true);

  // Test: Explicit React
  const reactRes = await testIntelligence("Build a website.", "Use React");
  const explReact = reactRes.reqs.nodes.find(n => n.text === "Use React.");
  assert.ok(explReact);
  assert.strictEqual(explReact.category, "Explicit");
  assert.strictEqual(explReact.confidence > 90, true);

  // Test: Implicit beginner
  const begRes = await testIntelligence("Explain how to code for a beginner.", "");
  const begReq = begRes.reqs.nodes.find(n => n.text.includes("jargon"));
  assert.ok(begReq);
  assert.strictEqual(begReq.category, "Implicit");
  assert.strictEqual(begReq.confidence > 70 && begReq.confidence < 95, true);
  assert.strictEqual(begReq.reason, "User indicated beginner audience");

  // Test: Hallucinated PostgreSQL
  const pgRes = await testIntelligence("Build a simple calculator.", "");
  const pgReq = pgRes.reqs.nodes.find(n => n.text === "Use PostgreSQL.");
  assert.ok(pgReq);
  assert.strictEqual(pgReq.category, "Rejected");
  assert.strictEqual(pgReq.confidence < 40, true);
  assert.strictEqual(pgReq.status, "rejected");
  assert.strictEqual(pgReq.reason, "No supporting evidence.");

  // Test: Empty prompt
  const emptyRes = await testIntelligence("", "");
  assert.ok(emptyRes.reqs.nodes.length > 0); // At least defaults/hallucinated will exist
  
  // Test: General prompt
  const genRes = await testIntelligence("Hello", "");
  assert.strictEqual(genRes.intent.primary.intent, "General");

  // Test: Coding prompt
  const codeRes = await testIntelligence("Build a node API.", "");
  assert.strictEqual(codeRes.intent.primary.intent, "Coding");
  const codeImplicit = codeRes.reqs.nodes.find(n => n.text === "Must adhere to standard coding conventions");
  assert.ok(codeImplicit);
  assert.strictEqual(codeImplicit.category, "Implicit");
  assert.strictEqual(codeImplicit.status, "accepted");
"""

content = content.replace('console.log("Intelligence Core Regression Tests passed.");', 'console.log("Intelligence Core Regression Tests passed.");' + new_tests)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
