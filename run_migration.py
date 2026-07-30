import re

file_path = '/app/applet/public/PROMPTFORGE_SYSTEM_SPECIFICATION.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace "#### Engine X: Name (Part Y)" with "#### Engine X: Name"
# The regex looks for #### Engine (\d+): (.*?) \(Part \d+\)
# and replaces it with #### Engine \1: \2
new_content = re.sub(
    r'#### Engine (\d+): (.*?) \(Part \d+\)',
    r'#### Engine \1: \2',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Migration successful")
