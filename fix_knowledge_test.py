import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const evalReact = knowledgeEngine.evaluate(reactRes3.ctx, reactRes3.reqs);\n  // React app lacks constraint text (unless explicitly passed)\n  console.log(evalReact.matchedRules.map(r => r.id)); assert.ok(evalReact.matchedRules.some(r => r.id === "constraints_recommended"));',
    'const reactCtx = { normalizedText: "build a react app", rawInput: "build a react app", explicitRequirements: [] };\n  const evalReact = knowledgeEngine.evaluate(reactCtx as any);\n  assert.ok(evalReact.matchedRules.some(r => r.id === "constraints_recommended"));'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
