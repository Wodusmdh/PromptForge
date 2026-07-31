import sys

with open('src/compiler/models/schemas.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'targetAssistant: z.enum(["gemini-ai-studio", "cursor-claude", "bolt-v0", "windsurf", "generic"]),',
    'targetAssistant: z.enum(["gemini-ai-studio", "cursor-claude", "bolt-v0", "windsurf", "generic"]).optional(),'
)
content = content.replace(
    'complexity: z.enum(["Small", "Medium", "Large", "Enterprise"]),',
    'complexity: z.enum(["Small", "Medium", "Large", "Enterprise"]).optional(),'
)
content = content.replace('stack: z.string(),', 'stack: z.string().optional(),')
content = content.replace('architectureStyle: z.string(),', 'architectureStyle: z.string().optional(),')
content = content.replace('uiStyle: z.string(),', 'uiStyle: z.string().optional(),')
content = content.replace('dbType: z.string(),', 'dbType: z.string().optional(),')
content = content.replace('securityLevel: z.string(),', 'securityLevel: z.string().optional(),')

with open('src/compiler/models/schemas.ts', 'w') as f:
    f.write(content)
