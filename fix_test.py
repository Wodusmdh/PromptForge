import sys

with open('src/api/tests/api.test.ts', 'r') as f:
    content = f.read()

content = content.replace('resSuccess.headers', 'resSuccess.header')

with open('src/api/tests/api.test.ts', 'w') as f:
    f.write(content)
