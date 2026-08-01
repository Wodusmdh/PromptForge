import sys

with open('src/compiler/core/promptAssembler.ts', 'r') as f:
    content = f.read()

import re
content = re.sub(r'    const validReqs[\s\S]*?    \}\);', """    const validReqs = requirements.nodes.filter(n => n.category !== "Rejected");
    sections.push({
      title: "Requirements",
      content: validReqs.map(n => `- [${n.priority}] ${n.description} (Category: ${n.category || "Explicit"}, Confidence: ${n.confidence || 100}%, Source: ${n.source || "User Input"})`).join("\\n"),
      order: 2
    });""", content)

with open('src/compiler/core/promptAssembler.ts', 'w') as f:
    f.write(content)
