import re

file_path = '/app/applet/public/PROMPTFORGE_SYSTEM_SPECIFICATION.md'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 39.6
content = content.replace(
    'Destructive operations must receive additional safeguards.',
    'Destructive operations must strictly enforce the authorization requirements of Section 39.3.'
)

content = content.replace(
    'The agent should identify the operation and its consequences before execution.',
    'The agent must explicitly identify the operation and its consequences, and secure the required authorization, prior to execution.'
)

# Fix 39.3 (which I didn't successfully patch earlier!)
old_39_3 = "High-risk operations require explicit human approval unless the project explicitly establishes a deterministic and narrowly scoped authorization policy."
new_39_3 = "High-risk operations must require explicit human approval unless a deterministic and narrowly scoped authorization policy has been explicitly satisfied. No high-risk operation may proceed without satisfying one of these two absolute conditions."

content = content.replace(old_39_3, new_39_3)

# Fix 39.11
old_39_11 = "Where appropriate, the global budget may include limits for:"
new_39_11 = "The global budget must include deterministic limits for:"
# Only replace the one in 39.11 Context
idx = content.find("#### 39.11")
if idx != -1:
    content = content[:idx] + content[idx:].replace(old_39_11, new_39_11, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

