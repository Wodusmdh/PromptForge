import re

file_path = '/app/applet/server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

rule_24 = """24. Agent Execution Governance & Risk Control (Part 39):
    - Human Approval: High-risk operations must require explicit human approval unless a deterministic and narrowly scoped authorization policy has been explicitly satisfied. No high-risk operation may proceed without satisfying one of these two absolute conditions.
    - Destructive Operations: Destructive operations must strictly enforce the authorization requirements of Section 39.3. The agent must explicitly identify the operation and its consequences, and secure the required authorization, prior to execution.
    - Budget Dimensions: The global budget must include deterministic limits for: maximum wall-clock time, maximum tool calls, maximum command executions, maximum retries, maximum self-correction cycles, maximum generated output, and maximum cost/token usage where measurable.

OUTPUT REQUIREMENTS:"""

if "Agent Execution Governance & Risk Control" not in content:
    content = content.replace("OUTPUT REQUIREMENTS:", rule_24)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched server.ts")
else:
    print("Already patched")
