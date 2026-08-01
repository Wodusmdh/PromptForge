import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

content = content.replace(
    'const userReq = {',
    'const userReq: any = {'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
