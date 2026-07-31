import sys

with open('src/compiler/core/parser.ts', 'r') as f:
    content = f.read()

replacement = """  static async extractIntent(request: UserRequest): Promise<ParsedIntent> {
    // Placeholder for actual LLM call
    const goals = [];
    if (request.complexity && request.stack) {
      goals.push(`Build a ${request.complexity} application using ${request.stack}`);
    } else {
      goals.push(`Build an application based on user request`);
    }

    return {
      primaryGoal: goals[0],
      secondaryGoals: ["Ensure clean architecture", "Apply strict security"],
      targetAudience: "General Users",
      businessDomain: "Software",
      technicalScope: request.architectureStyle || "As specified",
      assumptions: ["Standard web deployment"],
    };
  }
"""

import re
pattern = r'  static async extractIntent\(request: UserRequest\): Promise<ParsedIntent> \{[\s\S]*?  \}'
content = re.sub(pattern, replacement, content)

with open('src/compiler/core/parser.ts', 'w') as f:
    f.write(content)
