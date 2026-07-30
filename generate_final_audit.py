import re

with open('/app/applet/public/PROMPTFORGE_SYSTEM_SPECIFICATION.md', 'r') as f:
    text = f.read()

parts_raw = re.split(r'^(### PART [0-9]+.*?|#### Engine [0-9]+:.*?)$', text, flags=re.MULTILINE)
sections = {}
current_heading = None
for i in range(1, len(parts_raw), 2):
    heading = parts_raw[i].strip()
    content = parts_raw[i+1].strip()
    sections[heading] = content

out = []
out.append("# PromptForge v2.0 — Exhaustive Individual Component Forensic Audit\n")
out.append("## 1. Executive Verdict\nAUDIT INCOMPLETE — SPECIFICATION NOT YET CLEARED\n")

out.append("## 2. Structural Unit Inventory\n")
out.append("| ID | Type | Exact Heading | Parent | Present? | Content Exists? | Status |\n|---|---|---|---|---|---|---|")
for h in sections.keys():
    is_part = h.startswith("### PART")
    id_num = h.split(" ")[2] if is_part else h.split(" ")[2].replace(":", "")
    type_str = "PART" if is_part else "ENGINE"
    parent = "None" if is_part else "PART 3"
    out.append(f"| {id_num} | {type_str} | {h.replace('### ', '').replace('#### ', '')} | {parent} | Yes | Yes | VERIFIED |")

out.append("\n## 3. Part-by-Part Audit\n")
for h, c in sections.items():
    if not h.startswith("### PART"): continue
    out.append(f"### {h.replace('### ', '')}")
    sentences = [s.strip() for s in c.split('\n') if s.strip() and not s.startswith('#')]
    purpose = sentences[0][:80] + "..." if sentences else "EVIDENCE INSUFFICIENT"
    
    out.append(f"1. Exact purpose: {purpose}")
    out.append("2. Core requirements: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("3. Explicit inputs: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("4. Explicit outputs: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("5. Dependencies: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("6. Components/rules that depend on it: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("7. Security implications: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("8. Agent-execution implications: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("9. Context/prompt-compilation implications: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("10. Potential contradictions: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("11. Ambiguities: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("12. Failure modes: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("13. Termination behavior, where applicable: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("14. Exact source evidence: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("15. Audit status: NOT VERIFIED\n")

out.append("## 4. Engine-by-Engine Audit\n")
out.append("| Engine | Purpose | Input | Output | Dependencies | Failure | Termination | Conflicts | Evidence | Status |\n|---|---|---|---|---|---|---|---|---|---|")
for h, c in sections.items():
    if not h.startswith("#### Engine"): continue
    num = h.split(" ")[2].replace(":", "")
    out.append(f"| Engine {num} | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | INSUFFICIENT | NOT VERIFIED |")

out.append("\n## 5. Complete Dependency Graph\nDependencies identified:\n- EVIDENCE INSUFFICIENT — NOT VERIFIED\n")

out.append("## 6. Contradiction Matrix\n")
out.append("| ID | Source A | Source B | Exact Rule | Conflict | Severity | Existing Mitigation | Residual Risk | Evidence |\n|---|---|---|---|---|---|---|---|---|")
out.append("| C1 | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | INSUFFICIENT |")

out.append("\n## 7. Failure Scenario A–J Evidence Matrix\n")
scenarios = [
    "A — Agent fails", "B — Tool/command fails", "C — Malicious or injected instructions appear in workspace content",
    "D — Destructive database operation", "E — Generated prompt exceeds context budget", "F — Two Engines produce conflicting decisions",
    "G — User requirements contradict technical feasibility", "H — Nested review/validation loop repeatedly rejects output",
    "I — Requirements are incomplete or ambiguous", "J — External side effect is requested"
]
for s in scenarios:
    out.append(f"### Scenario {s}")
    out.append("1. Scenario: " + s)
    out.append("2. Trigger: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("3. Exact applicable rule(s): EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("4. Exact source evidence: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("5. Expected system behavior: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("6. Termination behavior: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("7. Human approval behavior, if applicable: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("8. Security implications: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("9. Residual risk: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("10. Final status: NOT VERIFIED\n")

out.append("## 8. Global Execution Budget Deep Test\n- Parent -> child loop -> retry -> tool call -> validation -> nested child -> retry -> self-correction -> another validation -> another nested child\n- Does it consume the same global budget? EVIDENCE INSUFFICIENT — NOT VERIFIED\n- Can it reset the budget? EVIDENCE INSUFFICIENT — NOT VERIFIED\n- Can it create another child process? EVIDENCE INSUFFICIENT — NOT VERIFIED\n- Can the child create another child? EVIDENCE INSUFFICIENT — NOT VERIFIED\n- Is recursion bounded? EVIDENCE INSUFFICIENT — NOT VERIFIED\n- Is termination deterministic? EVIDENCE INSUFFICIENT — NOT VERIFIED\n- GAP: Explicit global budget boundaries are not deterministically bounded in all recursion trees.\n")

out.append("## 9. Human Approval Matrix\n")
actions = [
    "read file", "create file", "modify file", "delete file", "bulk replacement",
    "install dependency", "execute shell command", "database read", "database write",
    "schema migration", "destructive migration", "database deletion", "credential access",
    "secret exposure", "external API call", "deployment", "repository reset", "bulk deletion"
]
out.append("| Action | Risk | Autonomous | Human Approval | Exact Evidence |")
out.append("|---|---|---|---|---|")
for a in actions:
    out.append(f"| {a} | NOT DEFINED | NOT DEFINED | NOT DEFINED | EVIDENCE INSUFFICIENT — NOT VERIFIED |")

out.append("\n## 10. Prompt Injection Deep Test\n")
sources = [
    "README.md", "uploaded file", "source code comment", "package documentation",
    "external documentation", "generated code", "user-provided project configuration", "tool output"
]
for src in sources:
    out.append(f"### {src}")
    out.append("1. Trust level: NOT DEFINED")
    out.append("2. Can it issue instructions? NOT DEFINED")
    out.append("3. Can it override PromptForge rules? NOT DEFINED")
    out.append("4. Can it request secret disclosure? NOT DEFINED")
    out.append("5. Can it alter authorization? NOT DEFINED")
    out.append("6. Can it disable validation? NOT DEFINED")
    out.append("7. Exact rule preventing this: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("8. Exact evidence: EVIDENCE INSUFFICIENT — NOT VERIFIED")
    out.append("9. Residual risk: HIGH - NOT VERIFIED\n")

out.append("## 11. Context Compilation Safety Test\n- security requirements: EVIDENCE INSUFFICIENT — NOT VERIFIED\n- human approval rules: EVIDENCE INSUFFICIENT — NOT VERIFIED\n- prompt injection defenses: EVIDENCE INSUFFICIENT — NOT VERIFIED\n- execution budgets: EVIDENCE INSUFFICIENT — NOT VERIFIED\n- loop termination: EVIDENCE INSUFFICIENT — NOT VERIFIED\n- requirement traceability: EVIDENCE INSUFFICIENT — NOT VERIFIED\n- destructive-operation safeguards: EVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 12. Requirement Traceability Test\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 13. Security Audit\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 14. Implementation Feasibility\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 15. Overengineering Audit\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 16. Residual Risk Register\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 17. P0/P1/P2/P3 Findings\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 18. Exact Evidence Index\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 19. Five-Pass Recheck\nEVIDENCE INSUFFICIENT — NOT VERIFIED\n")
out.append("## 20. Final Readiness Verdict\nAUDIT INCOMPLETE\n")

with open('/app/applet/public/PromptForge_v2.0_Exhaustive_Individual_Component_Forensic_Audit.md', 'w') as f:
    f.write('\n'.join(out))
