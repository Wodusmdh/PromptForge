import sys
import re

with open('src/compiler/models/domain.ts', 'r') as f:
    content = f.read()

# Update IntentNodeSchema
content = content.replace(
    'type: z.enum(["primary", "secondary"]),',
    'type: z.enum(["primary", "secondary"]),\n  intent: z.enum(["Coding", "Writing", "Translation", "Summarization", "Research", "Education", "Business", "Marketing", "Analysis", "Image Generation", "Video Generation", "Roleplay", "Mathematics", "General", "Unknown"]).optional(),'
)

# Update ReqNodeSchema
replacement = """  priority: z.enum(["high", "medium", "low"]),
  dependencies: z.array(z.string()),
  category: z.enum(["Explicit", "Implicit", "Optional", "Rejected"]).optional(),
  confidence: z.number().optional(),
  source: z.string().optional(),
  reason: z.string().optional()"""
content = re.sub(r'  priority: z\.enum\(\["high", "medium", "low"\]\),\n  dependencies: z\.array\(z\.string\(\)\)', replacement, content)

with open('src/compiler/models/domain.ts', 'w') as f:
    f.write(content)
