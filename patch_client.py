import sys

with open('src/playground/api/client.ts', 'r') as f:
    content = f.read()

content = content.replace('credentials: "omit"', 'credentials: "same-origin"')

# also add credentials: "same-origin" to the other fetches
for method in ['compile', 'optimize', 'analyze', 'validate', 'searchRules']:
    content = content.replace(f'method: "POST",\n      headers: this.getHeaders(),\n      body:', f'method: "POST",\n      headers: this.getHeaders(),\n      credentials: "same-origin",\n      body:')

with open('src/playground/api/client.ts', 'w') as f:
    f.write(content)
