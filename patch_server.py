import sys
import re

with open('server.ts', 'r') as f:
    content = f.read()

pattern = r'import crypto from "crypto";\n\napp\.use\(\(req, res, next\) => \{[\s\S]*?\}\);\n\napp\.use\("/api/v1", createApiRouter\(\)\);'
content = re.sub(pattern, 'app.use("/api/v1", createApiRouter());', content)

with open('server.ts', 'w') as f:
    f.write(content)
