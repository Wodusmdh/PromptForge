import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'assert.ok(helloQuality.overallScore < 50);',
    'console.log("HELLO SCORE: ", helloQuality.overallScore); assert.ok(helloQuality.overallScore < 50);'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
