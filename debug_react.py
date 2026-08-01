with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()
content = content.replace(
    'assert.ok(evalReact.matchedRules.some(r => r.id === "constraints_recommended"));',
    'console.log(evalReact.matchedRules.map(r => r.id)); assert.ok(evalReact.matchedRules.some(r => r.id === "constraints_recommended"));'
)
with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
