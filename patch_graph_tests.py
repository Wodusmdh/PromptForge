import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

import_statement = 'import { PromptGraphBuilder } from "../../compiler/core/promptGraph";\n'
content = import_statement + content

new_tests = """
  // === PHASE 4: PROMPT GRAPH ENGINE TESTS ===
  console.log("Starting Prompt Graph Engine Tests...");
  const graphBuilder = new PromptGraphBuilder();
  
  // Test: Hello
  const helloEval = knowledgeEngine.evaluate(helloRes3.ctx, helloRes3.reqs);
  const helloGraph = graphBuilder.build(helloRes3.ctx, helloRes3.intent, helloRes3.reqs, helloEval);
  assert.ok(helloGraph.findMissingNodes().some(n => n.type === "Objective"));
  assert.ok(helloGraph.findMissingNodes().some(n => n.type === "Audience"));
  assert.ok(helloGraph.nodes.size > 0);
  assert.ok(helloGraph.edges.length > 0);

  // Test: Explain APIs
  const explainEval = knowledgeEngine.evaluate(explainRes3.ctx, explainRes3.reqs);
  const explainGraph = graphBuilder.build(explainRes3.ctx, explainRes3.intent, explainRes3.reqs, explainEval);
  assert.ok(explainGraph.completedNodes.some(n => n.type === "Audience"));

  // Test: React app
  const reactCtx2 = { normalizedText: "build a react app", rawInput: "build a react app", explicitRequirements: [] };
  const reactEval2 = knowledgeEngine.evaluate(reactCtx2 as any, reactRes3.reqs);
  const reactGraph = graphBuilder.build(reactCtx2 as any, reactRes3.intent, reactRes3.reqs, reactEval2);
  assert.ok(reactGraph.completedNodes.some(n => n.type === "Objective"));

  // Test: Business plan
  const busEval = knowledgeEngine.evaluate(busCtx as any);
  const busGraph = graphBuilder.build(busCtx as any, res1.intent, res1.reqs, busEval); // dummy intent/reqs
  assert.ok(busGraph.nodes.size > 0);

  // Test: Translation
  const transEval = knowledgeEngine.evaluate(transCtx as any);
  const transGraph = graphBuilder.build(transCtx as any, res5.intent, res5.reqs, transEval);
  assert.ok(transGraph.nodes.size > 0);

  // Test: Story writing
  const writeEval = knowledgeEngine.evaluate(writeCtx as any);
  const writeGraph = graphBuilder.build(writeCtx as any, res6.intent, res6.reqs, writeEval);
  assert.ok(writeGraph.nodes.size > 0);

  // Test: Conflicting prompt
  const conflictEval = knowledgeEngine.evaluate(conflictRes3.ctx, conflictRes3.reqs);
  const conflictGraph = graphBuilder.build(conflictRes3.ctx, conflictRes3.intent, conflictRes3.reqs, conflictEval);
  assert.ok(conflictGraph.findConflictingNodes().length > 0);

  // Test: Duplicate constraints
  const dupEval = knowledgeEngine.evaluate(dupRes.ctx, dupRes.reqs);
  const dupGraph = graphBuilder.build(dupRes.ctx, dupRes.intent, dupRes.reqs, dupEval);
  assert.ok(dupGraph.findDuplicatedConstraints().length > 0);

  // Serialize check
  const jsonGraph = helloGraph.toJSON();
  assert.ok(jsonGraph.graphVersion === "1.0.0");
  assert.ok(jsonGraph.nodes.length > 0);

  console.log("Prompt Graph Engine Tests passed.");
"""

content = content.replace('console.log("Rule Intelligence integration test passed successfully.");', new_tests + '\n  console.log("Rule Intelligence integration test passed successfully.");')

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
