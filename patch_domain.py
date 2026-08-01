import sys

with open('src/compiler/models/domain.ts', 'r') as f:
    content = f.read()

import re

# Add text, status, duplicateCount to ReqNodeSchema
replacement_req = """  confidence: z.number().optional(),
  source: z.string().optional(),
  reason: z.string().optional(),
  text: z.string().optional(),
  status: z.enum(["accepted", "needs user clarification", "rejected"]).optional(),
  duplicateCount: z.number().optional()"""

content = re.sub(r'  confidence: z\.number\(\)\.optional\(\),\n  source: z\.string\(\)\.optional\(\),\n  reason: z\.string\(\)\.optional\(\)', replacement_req, content)

# Add metrics to RequirementGraphSchema
replacement_graph = """export const RequirementGraphSchema = z.object({
  nodes: z.array(ReqNodeSchema),
  edges: z.array(z.object({ from: z.string(), to: z.string() })),
  metrics: z.object({
    requirementCoverage: z.number(),
    conflictCount: z.number(),
    duplicateCount: z.number(),
    rejectedCount: z.number(),
    acceptedCount: z.number(),
    missingCriticalCount: z.number()
  }).optional()
});"""

content = re.sub(r'export const RequirementGraphSchema = z\.object\(\{\n  nodes: z\.array\(ReqNodeSchema\),\n  edges: z\.array\(z\.object\(\{ from: z\.string\(\), to: z\.string\(\) \}\)\)\n\}\);', replacement_graph, content)

with open('src/compiler/models/domain.ts', 'w') as f:
    f.write(content)
