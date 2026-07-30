import re

with open('server.ts', 'r') as f:
    content = f.read()

content = re.sub(r'temperature:\s*[0-9\.]+,\n\s*', '', content)
content = re.sub(r'top_p:\s*[0-9\.]+,\n\s*', '', content)
content = re.sub(r'top_k:\s*[0-9]+,\n\s*', '', content)
content = re.sub(r'temperature:\s*[0-9\.]+,?', '', content)

with open('server.ts', 'w') as f:
    f.write(content)
