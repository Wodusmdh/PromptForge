import re

with open('server.ts', 'r') as f:
    content = f.read()

# Add import for createApiRouter
if 'import { createApiRouter }' not in content:
    content = content.replace(
        'import dotenv from "dotenv";', 
        'import dotenv from "dotenv";\nimport { createApiRouter } from "./src/api/routes/index.js";'
    )

# Make Gemini model configurable
if 'const GEMINI_MODEL' not in content:
    content = content.replace(
        'const app = express();',
        'const app = express();\nconst GEMINI_MODEL = process.env.PROMPTFORGE_GEMINI_MODEL || "gemini-3.6-flash";'
    )

# Mount /api/v1 router
if 'app.use("/api/v1"' not in content:
    content = content.replace(
        'app.use(express.json({ limit: "10mb" }));',
        'app.use(express.json({ limit: "10mb" }));\napp.use("/api/v1", createApiRouter());'
    )

# Replace hardcoded "gemini-3.6-flash" with GEMINI_MODEL
content = content.replace('"gemini-3.6-flash"', 'GEMINI_MODEL')

# Remove temperature, top_p, top_k from config
content = re.sub(r'\\s*temperature:\\s*[\\d\\.]+,?', '', content)
content = re.sub(r'\\s*top_p:\\s*[\\d\\.]+,?', '', content)
content = re.sub(r'\\s*top_k:\\s*\\d+,?', '', content)

# Wait, `import { createApiRouter } from "./src/api/routes/index.js";` is needed for Node ESM resolution usually, but ts-node/tsx might handle extensionless.
# I will use extensionless just in case because the rest of the project might be extensionless.
content = content.replace('./src/api/routes/index.js', './src/api/routes')

with open('server.ts', 'w') as f:
    f.write(content)
