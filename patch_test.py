import sys

with open('src/api/tests/api.test.ts', 'r') as f:
    content = f.read()

replacement = """  // Test 13: Oversized Payload
  const largePayload = {
    idea: "A".repeat(2 * 1024 * 1024), // 2MB string
    targetAssistant: "gemini"
  };
  const resOversize = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send(largePayload);
  assert.strictEqual(resOversize.status, 413); // Payload Too Large
  console.log("Oversized payload test passed.");

  // Test 14: Rate Limit
  // In tests, the limit is 100 requests. We will just simulate it by sending requests until it 429s, 
  // but to avoid taking too long, we will use a different user/IP and a test config if possible, 
  // or we can just verify the rate limit headers exist on a normal request.
  assert.ok(resSuccess.headers["x-ratelimit-limit"]);
  assert.ok(resSuccess.headers["x-ratelimit-remaining"]);
  assert.ok(resSuccess.headers["x-ratelimit-reset"]);
  console.log("Rate limit headers test passed.");

  console.log("API integration test passed successfully.");"""

content = content.replace('  console.log("Error paths test passed.");\n\n  console.log("API integration test passed successfully.");', 
                          '  console.log("Error paths test passed.");\n\n' + replacement)

with open('src/api/tests/api.test.ts', 'w') as f:
    f.write(content)
