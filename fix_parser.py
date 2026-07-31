with open('src/compiler/core/parser.ts', 'r') as f:
    content = f.read()
import re
content = re.sub(r'    \}\s*};\s*\}\}', '    };\n  }\n}', content)
with open('src/compiler/core/parser.ts', 'w') as f:
    f.write(content)
