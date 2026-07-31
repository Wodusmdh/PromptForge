import sys

with open('src/compiler/core/requestParser.ts', 'r') as f:
    content = f.read()

replacement = """
    const explicitRequirements: string[] = [];
    if (request.targetAssistant) explicitRequirements.push(`Target Assistant: ${request.targetAssistant}`);
    if (request.complexity) explicitRequirements.push(`Complexity: ${request.complexity}`);
    if (request.stack) explicitRequirements.push(`Tech Stack: ${request.stack}`);
    if (request.architectureStyle) explicitRequirements.push(`Architecture: ${request.architectureStyle}`);
    if (request.uiStyle) explicitRequirements.push(`UI Style: ${request.uiStyle}`);
    if (request.dbType) explicitRequirements.push(`Database: ${request.dbType}`);
    if (request.securityLevel) explicitRequirements.push(`Security: ${request.securityLevel}`);
"""

import re
pattern = r'const explicitRequirements = \[\s*`Target Assistant: \$\{request\.targetAssistant\}`,\s*`Complexity: \$\{request\.complexity\}`,\s*`Tech Stack: \$\{request\.stack\}`,\s*`Architecture: \$\{request\.architectureStyle\}`,\s*`UI Style: \$\{request\.uiStyle\}`,\s*`Database: \$\{request\.dbType\}`,\s*`Security: \$\{request\.securityLevel\}`\s*\];'
content = re.sub(pattern, replacement, content)

with open('src/compiler/core/requestParser.ts', 'w') as f:
    f.write(content)
