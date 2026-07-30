import sys

with open('src/api/tests/api.test.ts', 'r') as f:
    content = f.read()

content = content.replace('async function runTests() {\n  console.log("Starting API Tests...");', 'async function runTests() {\n  process.env.PROMPTFORGE_API_KEY = "test-token";\n  console.log("Starting API Tests...");')

content = content.replace('.set("Authorization", "Bearer token")', '.set("Authorization", "Bearer test-token")')

with open('src/api/tests/api.test.ts', 'w') as f:
    f.write(content)
