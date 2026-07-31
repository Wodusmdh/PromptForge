import sys
import re

with open('src/api/controllers/promptController.ts', 'r') as f:
    content = f.read()

replacement = """      const requestPayload: any = {
        idea
      };
      
      if (normalizedAssistant && normalizedAssistant !== "generic") {
        requestPayload.targetAssistant = normalizedAssistant;
      }
      
      if (rest.complexity) requestPayload.complexity = rest.complexity;
      if (rest.stack) requestPayload.stack = rest.stack;
      if (rest.architectureStyle) requestPayload.architectureStyle = rest.architectureStyle;
      if (rest.uiStyle) requestPayload.uiStyle = rest.uiStyle;
      if (rest.dbType) requestPayload.dbType = rest.dbType;
      if (rest.securityLevel) requestPayload.securityLevel = rest.securityLevel;
      if (rest.additionalRules) requestPayload.additionalRules = rest.additionalRules;
"""

pattern = r'const requestPayload = \{[\s\S]*?additionalRules: rest\.additionalRules \|\| "",\n\s*\};'
content = re.sub(pattern, replacement, content)

with open('src/api/controllers/promptController.ts', 'w') as f:
    f.write(content)
