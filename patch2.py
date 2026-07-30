import os
import re

file_path = '/app/applet/public/PROMPTFORGE_SYSTEM_SPECIFICATION.md'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'Destructive operations must receive additional safeguards\.\n\nExamples:\n- database DROP\n- destructive migration\n- bulk deletion\n- repository reset\n- mass file deletion\n- production configuration replacement\n\nThe agent should identify the operation and its consequences before execution\.',
    r'Destructive operations must strictly enforce the authorization requirements of Section 39.3.\n\nExamples:\n- database DROP\n- destructive migration\n- bulk deletion\n- repository reset\n- mass file deletion\n- production configuration replacement\n\nThe agent must explicitly identify the operation and its consequences, and secure the required authorization, prior to execution.',
    content
)

content = re.sub(
    r'Where appropriate, the global budget may include limits for:',
    r'The global budget must include deterministic limits for:',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
