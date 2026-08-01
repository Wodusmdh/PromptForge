import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'testIntelligence("Use React.", "Do not use React.")',
    'testIntelligence("App", "- Use React.\\n- Do not use React.")'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
