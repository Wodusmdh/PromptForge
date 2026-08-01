import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'assert.strictEqual(pgReq.status, "rejected");',
    'assert.strictEqual(pgReq.status, "Rejected");'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
