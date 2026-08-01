import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

import_statement = 'import { PromptQualityAnalyzer } from "../../compiler/core/promptAnalyzer";\n'
content = import_statement + content

new_tests = """
  // === PHASE 3: PROMPT QUALITY ANALYZER TESTS ===
  console.log("Starting Prompt Quality Analyzer Tests...");
  
  const qualityAnalyzer = new PromptQualityAnalyzer();

  // Test: Hello
  const helloRes3 = await testIntelligence("Hello", "");
  const helloQuality = qualityAnalyzer.analyze(helloRes3.ctx, helloRes3.reqs);
  assert.ok(helloQuality.overallScore < 50);

  // Test: Explain APIs to beginners.
  const explainRes3 = await testIntelligence("Explain APIs for beginners.", "");
  const explainQuality = qualityAnalyzer.analyze(explainRes3.ctx, explainRes3.reqs);
  assert.ok(explainQuality.dimensionScores["Objective Clarity"].score > 90);

  // Test: Build a React application.
  const reactRes3 = await testIntelligence("Build a React application.", "");
  const reactQuality = qualityAnalyzer.analyze(reactRes3.ctx, reactRes3.reqs);
  // Also check Coding intent
  assert.strictEqual(reactRes3.intent.primary.intent, "Coding");

  // Test: Write a horror story.
  const horrorRes3 = await testIntelligence("Write a horror story.", "");
  const horrorQuality = qualityAnalyzer.analyze(horrorRes3.ctx, horrorRes3.reqs);
  assert.strictEqual(horrorRes3.intent.primary.intent, "Writing");

  // Test: Translate this into Japanese.
  const transRes3 = await testIntelligence("Translate this into Japanese.", "");
  const transQuality = qualityAnalyzer.analyze(transRes3.ctx, transRes3.reqs);
  assert.strictEqual(transRes3.intent.primary.intent, "Translation");

  // Test: Conflicting prompt.
  const conflictRes3 = await testIntelligence("App", "- Use React.\\n- Do not use React.");
  const conflictQuality = qualityAnalyzer.analyze(conflictRes3.ctx, conflictRes3.reqs);
  assert.strictEqual(conflictQuality.dimensionScores["Conflicting Instructions"].score, 20);

  console.log("Prompt Quality Analyzer Tests passed.");
"""

content = content.replace('return { intent, reqs };', 'return { intent, reqs, ctx };')
content = content.replace('console.log("Reasoning Engine Tests passed.");', 'console.log("Reasoning Engine Tests passed.");\n' + new_tests)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
