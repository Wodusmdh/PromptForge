import sys

with open('src/api/models/schemas.ts', 'r') as f:
    content = f.read()

content = content.replace('(err as z.ZodError).errors.map(e => `${e.path.join(\'.\')}: ${e.message}`).join(\', \')', 'err.message')

with open('src/api/models/schemas.ts', 'w') as f:
    f.write(content)
