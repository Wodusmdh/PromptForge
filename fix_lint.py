import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'targetAssistant: "gemini-ai-studio",',
    'timestamp: new Date(),\n      targetAssistant: "gemini-ai-studio",'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
