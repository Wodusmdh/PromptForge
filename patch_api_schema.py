import sys

with open('src/api/models/schemas.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'targetAssistant: z.string().min(1, "Missing or invalid \'targetAssistant\'."),',
    'targetAssistant: z.string().optional(),'
)

with open('src/api/models/schemas.ts', 'w') as f:
    f.write(content)
