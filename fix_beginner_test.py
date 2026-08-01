import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'assert.strictEqual(begReq.reason, "User indicated beginner audience");',
    'assert.strictEqual(begReq.reason, "The user identified themselves as a beginner.");'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
