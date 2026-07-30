import sys

with open('src/playground/api/client.ts', 'r') as f:
    content = f.read()

content = content.replace('"X-API-Key": "test-key" // Mock API Key for local dev', '...((window as any).PROMPTFORGE_API_KEY ? { "X-API-Key": (window as any).PROMPTFORGE_API_KEY } : {})')

with open('src/playground/api/client.ts', 'w') as f:
    f.write(content)
