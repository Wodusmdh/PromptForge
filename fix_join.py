with open('src/compiler/core/promptAssembler.ts', 'r') as f:
    code = f.read()

import re
code = re.sub(r'\)\`\)\.join\("\n"\)', ')`).join("\\n")', code)
with open('src/compiler/core/promptAssembler.ts', 'w') as f:
    f.write(code)
