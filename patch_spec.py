import os

file_path = '/app/applet/public/PROMPTFORGE_SYSTEM_SPECIFICATION.md'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# REL-002
old_39_3 = """#### 39.3 Human Approval

High-risk operations require explicit human approval unless the project explicitly establishes a deterministic and narrowly scoped authorization policy."""
new_39_3 = """#### 39.3 Human Approval

High-risk operations must require explicit human approval unless a deterministic and narrowly scoped authorization policy has been explicitly satisfied. No high-risk operation may proceed without satisfying one of these two absolute conditions."""

old_39_6 = """#### 39.6 Destructive Operations

Destructive operations must receive additional safeguards.

Examples:
- database DROP
- destructive migration
- bulk deletion
- repository reset
- mass file deletion
- production configuration replacement

The agent should identify the operation and its consequences before execution."""

new_39_6 = """#### 39.6 Destructive Operations

Destructive operations must strictly enforce the authorization requirements of Section 39.3.

Examples:
- database DROP
- destructive migration
- bulk deletion
- repository reset
- mass file deletion
- production configuration replacement

The agent must explicitly identify the operation and its consequences, and secure the required authorization, prior to execution."""

# REL-001
old_39_11 = """#### 39.11 Budget Dimensions

Where appropriate, the global budget may include limits for:
- maximum wall-clock time"""

new_39_11 = """#### 39.11 Budget Dimensions

The global budget must include deterministic limits for:
- maximum wall-clock time"""

if old_39_3 in content:
    content = content.replace(old_39_3, new_39_3)
else:
    print("Failed to find 39.3")

if old_39_6 in content:
    content = content.replace(old_39_6, new_39_6)
else:
    print("Failed to find 39.6")

if old_39_11 in content:
    content = content.replace(old_39_11, new_39_11)
else:
    print("Failed to find 39.11")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
