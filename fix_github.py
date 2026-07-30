with open('src/github/GitHubProvider.ts', 'r') as f:
    content = f.read()

content = content.replace(r'\`', '`')
content = content.replace(r'\$', '$')

with open('src/github/GitHubProvider.ts', 'w') as f:
    f.write(content)
