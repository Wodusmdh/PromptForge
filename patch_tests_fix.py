import sys

with open('src/api/tests/api.test.ts', 'r') as f:
    content = f.read()

content = content.replace('      additionalRules: "- Use simple Indonesian.- Give one real-world analogy.- Explain frontend, backend, API, and database.- Give one small request/response example.- Use clear headings.- Do not assume prior programming knowledge."\n', '      additionalRules: "- Use simple Indonesian.\\n- Give one real-world analogy.\\n- Explain frontend, backend, API, and database.\\n- Give one small request/response example.\\n- Use clear headings.\\n- Do not assume prior programming knowledge."\n')

with open('src/api/tests/api.test.ts', 'w') as f:
    f.write(content)
