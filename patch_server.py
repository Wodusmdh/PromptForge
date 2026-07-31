import sys

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'app.use(express.json({ limit: "10mb" }));',
    'const MAX_BODY_SIZE = process.env.PROMPTFORGE_MAX_BODY_SIZE || "1mb";\napp.use(express.json({ limit: MAX_BODY_SIZE }));'
)

with open('server.ts', 'w') as f:
    f.write(content)
