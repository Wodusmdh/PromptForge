import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

import_statement = 'import { PromptExplainabilityEngine } from "../../compiler/core/explainabilityEngine";\n'
content = import_statement + content

new_tests = """
  // === PHASE 5: PROMPT EXPLAINABILITY ENGINE TESTS ===
  console.log("Starting Prompt Explainability Engine Tests...");
  const explainabilityEngine = new PromptExplainabilityEngine();
  
  // Test: Normalization, Duplicate, Conflict, Accepted, Rejected, Missing Info
  explainabilityEngine.generateExplanations(dupRes.ctx, dupRes.reqs, dupGraph);
  explainabilityEngine.generateExplanations(conflictRes3.ctx, conflictRes3.reqs, conflictGraph);
  explainabilityEngine.generateExplanations(pgRes.ctx, pgRes.reqs, null as any); // pgRes has Rejected requirement
  
  const log = explainabilityEngine.getDecisionLog();
  assert.ok(log.length > 0);
  assert.ok(explainabilityEngine.getRejectedItems().length > 0); // pgRes Rejected
  assert.ok(explainabilityEngine.getConflicts().length > 0); // conflictRes3 Conflict
  assert.ok(log.some(d => d.decision === "Duplicate Removal")); // dupRes Duplicate Removal
  
  const changeHist = explainabilityEngine.getChangeHistory();
  assert.ok(changeHist.length > 0);
  
  console.log("Prompt Explainability Engine Tests passed.");
"""

content = content.replace('console.log("Rule Intelligence integration test passed successfully.");', new_tests + '\n  console.log("Rule Intelligence integration test passed successfully.");')

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
