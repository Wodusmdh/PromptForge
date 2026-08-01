import re

with open('src/compiler/models/domain.ts', 'r') as f:
    content = f.read()

# Update ReqNodeSchema
replacement_req = """  confidence: z.number().optional(),
  source: z.string().optional(),
  reason: z.string().optional(),
  evidence: z.string().optional(),
  origin: z.string().optional(),
  text: z.string().optional(),
  status: z.enum(["Accepted", "Optional", "Rejected", "Conflict", "Missing Information", "accepted", "needs user clarification", "rejected"]).optional(),
  duplicateCount: z.number().optional()"""

content = re.sub(r'  confidence: z\.number\(\)\.optional\(\),\n  source: z\.string\(\)\.optional\(\),\n  reason: z\.string\(\)\.optional\(\),\n  text: z\.string\(\)\.optional\(\),\n  status: z\.enum\(\["accepted", "needs user clarification", "rejected"\]\)\.optional\(\),\n  duplicateCount: z\.number\(\)\.optional\(\)', replacement_req, content)

with open('src/compiler/models/domain.ts', 'w') as f:
    f.write(content)
