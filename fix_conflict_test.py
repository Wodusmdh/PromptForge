import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'assert.strictEqual(reactConf.status, "needs user clarification");',
    'assert.strictEqual(reactConf.status, "Conflict");'
)
content = content.replace(
    'assert.strictEqual(noReactConf.status, "needs user clarification");',
    'assert.strictEqual(noReactConf.status, "Conflict");'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
