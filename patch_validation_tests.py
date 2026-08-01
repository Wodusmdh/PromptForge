import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

import_statement = 'import { PromptValidationEngine } from "../../compiler/core/validationEngine";\n'
content = import_statement + content

new_tests = """
  // === PHASE 6: PROMPT VALIDATION ENGINE TESTS ===
  console.log("Starting Prompt Validation Engine Tests...");
  const validationEngine = new PromptValidationEngine();
  
  // Test: Hello
  const helloVal = validationEngine.validate(helloRes3.ctx, helloRes3.reqs, helloGraph, helloQuality, helloEval);
  assert.ok(helloVal.validationScore < 50);
  assert.ok(helloVal.issues.some(i => i.type === "Missing Objective"));
  
  // Test: Explain APIs
  const explainVal = validationEngine.validate(explainRes3.ctx, explainRes3.reqs, explainGraph, explainQuality, explainEval);
  assert.ok(explainVal.passedChecks.some(c => c.ruleName === "Missing Audience"));
  
  // Test: React app
  const reactVal = validationEngine.validate(reactCtx2 as any, reactRes3.reqs, reactGraph, reactQuality, reactEval2);
  assert.ok(reactVal.validationScore > 0);
  
  // Test: Business plan
  const busVal = validationEngine.validate(busCtx as any, res1.reqs, busGraph, helloQuality, busEval);
  assert.ok(busVal.overallStatus !== undefined);
  
  // Test: Translation
  const transVal = validationEngine.validate(transCtx as any, res5.reqs, transGraph, transQuality, transEval);
  assert.ok(transVal.passedChecks.length > 0);
  
  // Test: Conflicting prompt
  const conflictVal = validationEngine.validate(conflictRes3.ctx, conflictRes3.reqs, conflictGraph, conflictQuality, conflictEval);
  assert.ok(conflictVal.issues.some(i => i.type === "Conflicting Constraints"));
  
  // Test: Duplicate constraints
  const dupVal = validationEngine.validate(dupRes.ctx, dupRes.reqs, dupGraph, helloQuality, dupEval);
  assert.ok(dupVal.suggestions.some(i => i.type === "Duplicate Requirements") || dupVal.warnings.some(i => i.type === "Duplicate Requirements") || dupVal.issues.some(i => i.type === "Duplicate Requirements"));
  
  // Test: Empty prompt
  const emptyVal = validationEngine.validate(emptyRes.ctx, emptyRes.reqs, helloGraph, helloQuality, helloEval);
  assert.ok(emptyVal.validationScore === 0);

  console.log("Prompt Validation Engine Tests passed.");
"""

content = content.replace('console.log("Rule Intelligence integration test passed successfully.");', new_tests + '\n  console.log("Rule Intelligence integration test passed successfully.");')

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
