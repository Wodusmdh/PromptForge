import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'assert.strictEqual(codeImplicit.status, "accepted");',
    'assert.strictEqual(codeImplicit.status, "Accepted");'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
