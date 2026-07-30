with open('src/github/types.ts', 'r') as f:
    content = f.read()

content = content.replace(r'\`', '`')
content = content.replace(r'\$', '$')

with open('src/github/types.ts', 'w') as f:
    f.write(content)
