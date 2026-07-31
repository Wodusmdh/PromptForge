import sys

with open('src/playground/api/client.ts', 'r') as f:
    content = f.read()

content = content.replace('targetAssistant: string = "gemini"', 'targetAssistant?: string')
# Wait, if targetAssistant is optional, the body might have undefined.
# JSON.stringify removes undefined keys, which is fine.

with open('src/playground/api/client.ts', 'w') as f:
    f.write(content)
