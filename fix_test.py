with open('src/intelligence/tests/local.test.ts', 'r') as f:
    content = f.read()

content = content.replace('assert.strictEqual(run.state, "COMPLETED_WITH_WARNINGS");', 'assert.strictEqual(run.state, "FAILED");')

with open('src/intelligence/tests/local.test.ts', 'w') as f:
    f.write(content)
