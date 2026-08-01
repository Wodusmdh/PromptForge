import sys

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const busCtx = { normalizedText: "write a marketing plan"',
    'const busCtx = { normalizedText: "write a business plan"'
)
content = content.replace(
    'rawInput: "write a marketing plan"',
    'rawInput: "write a business plan"'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
