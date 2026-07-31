import sys
import re

with open('src/api/tests/api.test.ts', 'r') as f:
    content = f.read()

replacement = r"""  // Test 14: Rate Limit
  // Verify the rate limit headers exist on a normal request.
  assert.ok(resSuccess.header["x-ratelimit-limit"]);
  assert.ok(resSuccess.header["x-ratelimit-remaining"]);
  assert.ok(resSuccess.header["x-ratelimit-reset"]);
  console.log("Rate limit headers test passed.");

  // Test 15: Regression - Do not hallucinate requirements
  const resRegression1 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Explain what an API is to a beginner.",
      additionalRules: "- Use simple Indonesian.\n- Give one real-world analogy.\n- Explain frontend, backend, API, and database.\n- Give one small request/response example.\n- Use clear headings.\n- Do not assume prior programming knowledge."
    });

  assert.strictEqual(resRegression1.status, 200, "Regression1 compile failed");
  const markdown1 = resRegression1.body.compiledPrompt.compiledMarkdown;
  
  const forbidden1 = ["React", "Express", "Tailwind", "PostgreSQL", "Modular Monolith", "gemini-ai-studio"];
  for (const f of forbidden1) {
    if (markdown1.includes(f)) {
      throw new Error(`Regression1 failed: found forbidden string '${f}' in output.`);
    }
  }

  const required1 = ["Indonesian", "API", "frontend", "backend", "database", "request/response", "beginner", "real-world analogy", "clear headings"];
  for (const r of required1) {
    if (!markdown1.toLowerCase().includes(r.toLowerCase())) {
      throw new Error(`Regression1 failed: missing required string '${r}' in output.`);
    }
  }
  console.log("Regression test 1 passed.");

  // Test 16: Regression - Preserve explicitly provided stack
  const resRegression2 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Build a React 19 frontend with Express and PostgreSQL.",
      stack: "React 19 + Express",
      dbType: "PostgreSQL"
    });

  assert.strictEqual(resRegression2.status, 200);
  const markdown2 = resRegression2.body.compiledPrompt.compiledMarkdown;
  
  const required2 = ["React 19", "Express", "PostgreSQL"];
  for (const r of required2) {
    if (!markdown2.includes(r)) {
      throw new Error(`Regression2 failed: missing required string '${r}' in output.`);
    }
  }
  console.log("Regression test 2 passed.");

  // Test 17: Regression - Preserve explicit UI style
  const resRegression3 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Design a modern minimalist dashboard using React.",
      uiStyle: "Modern Minimalist",
      stack: "React"
    });

  assert.strictEqual(resRegression3.status, 200);
  const markdown3 = resRegression3.body.compiledPrompt.compiledMarkdown;
  
  assert.ok(markdown3.toLowerCase().includes("modern minimalist"));
  assert.ok(markdown3.toLowerCase().includes("react"));
  console.log("Regression test 3 passed.");

  // Test 18: Regression - Preserve explicit Architecture
  const resRegression4 = await request(app)
    .post("/api/v1/compile")
    .set("Authorization", "Bearer test-token")
    .send({
      idea: "Create a modular monolith backend using Express and PostgreSQL.",
      architectureStyle: "Modular monolith",
      stack: "Express",
      dbType: "PostgreSQL"
    });

  assert.strictEqual(resRegression4.status, 200);
  const markdown4 = resRegression4.body.compiledPrompt.compiledMarkdown;
  
  assert.ok(markdown4.toLowerCase().includes("modular monolith"));
  assert.ok(markdown4.toLowerCase().includes("express"));
  assert.ok(markdown4.toLowerCase().includes("postgresql"));
  console.log("Regression test 4 passed.");

  console.log("API integration test passed successfully.");
"""

pattern = r'  // Test 14: Rate Limit\n[\s\S]*?console\.log\("API integration test passed successfully\."\);'
content = re.sub(pattern, replacement, content)

# Also fix the additionalRules string
content = content.replace('      additionalRules: "- Use simple Indonesian.\n- Give one real-world analogy.\n- Explain frontend, backend, API, and database.\n- Give one small request/response example.\n- Use clear headings.\n- Do not assume prior programming knowledge."\n', '      additionalRules: "- Use simple Indonesian.\\n- Give one real-world analogy.\\n- Explain frontend, backend, API, and database.\\n- Give one small request/response example.\\n- Use clear headings.\\n- Do not assume prior programming knowledge."\n')

with open('src/api/tests/api.test.ts', 'w') as f:
    f.write(content)
