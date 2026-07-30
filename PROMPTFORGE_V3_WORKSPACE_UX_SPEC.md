# PromptForge v3 - AI Workspace Experience Upgrade Specification

## 1. Workspace Architecture
The PromptForge v3 workspace abandons the traditional "form-to-output" paradigm, evolving into a true operating system for prompt engineering. 
The architecture is fluid, composed of independent, intelligent panels that adapt to the user's workflow—from ideation to validation and deployment.
- **Core Principle**: Spatial persistence. Users should never feel they have left their workspace to view history or settings.
- **Layout Foundation**:
  - Global Command Header (Top)
  - Activity Bar (Far Left, collapsable)
  - Main Stage (Center, fluid width)
  - Auxiliary Stage (Right/Bottom, dockable)

## 2. Panel System
Every tool in the application exists as a distinct panel.
- **Modularity**: Panels can be maximized, minimized, or snapped into a grid.
- **Types of Panels**:
  - *Input*: Prompt Editor, Rule Selection, Context Injection.
  - *Output*: Live Preview, Timeline, Benchmark View.
  - *Intelligence*: AI Assistant, Prompt Inspector, Validation.
- **State Persistence**: The workspace automatically saves panel sizes, positions, and visibility states locally. Returning to a project restores the exact layout.

## 3. Docking System
Users require different layouts for different tasks (writing vs. debugging).
- **Drag-and-Drop Structure**: Panels can be dragged by their header. Drop zones illuminate when dragging, indicating where the panel will snap.
- **Split Views**: The Main Stage supports horizontal and vertical splitting, allowing users to view the Editor alongside History, or Editor stacked above Output.
- **Collapsing**: Double-clicking a panel divider maximizes it; clicking a chevron collapses it into the nearest edge, turning it into a thin "tray" that can be expanded on hover.

## 4. Smart Context Panel
The Context Panel serves as the situational awareness engine of the workspace.
- **Location**: Typically docked top-right or within a collapsed sidebar tray.
- **Live Diagnostics**:
  - *Project Summary*: Auto-generated one-sentence goal based on the current prompt.
  - *Detected Technologies*: e.g., "React, Tailwind, Node.js" inferred from the text.
  - *Token Telemetry*: Real-time estimate of context window usage and complexity score.
  - *Risk Radar*: Flags potential prompt vulnerabilities (e.g., "Missing fallback behavior", "Ambiguous error handling").

## 5. Prompt Inspector
A visual, diagnostic view of the compiled prompt.
- **Visual Structure**: The compiled text is not just a block of markdown. It is a structured node tree.
- **Features**:
  - *Rule Mapping*: Clicking a generated section highlights which "Golden Rule" produced it.
  - *Execution Order*: Visualizes the sequence of instructions the LLM will follow.
  - *Conflict Detection*: Highlights contradictory constraints (e.g., "Rule 3 requests extreme brevity, Rule 8 requests exhaustive comments").
  - *Heatmap*: Overlays a color-coded heatmap showing which parts of the prompt consume the most tokens.

## 6. Live AI Assistant
An always-present, context-aware pairing partner, not just a chatbot.
- **Context Awareness**: It silently reads the Editor, the active Rules, and Validation errors.
- **Proactive Interventions**:
  - If a validation fails, the assistant inline-suggests: "I noticed the 'Security First' rule failed. Shall I inject authorization checks into your prompt?"
  - During ideation: "You've mentioned PostgreSQL, but no schema rules are active. Would you like me to attach them?"
- **Interaction**: Exists as a floating widget or a docked panel, primarily responding to the current workspace state rather than requiring manual context-setting.

## 7. Timeline
A visual history of the prompt's evolution, modeled after a CI/CD pipeline or Git history.
- **Event Logging**: Every Compile, Validate, and Optimize action creates a node on the timeline.
- **Visuals**: A horizontal or vertical track. Green nodes (Success), Red nodes (Validation Failure), Yellow nodes (Optimized).
- **Metadata**: Hovering a node reveals execution time, tokens used, and the specific engine version utilized.

## 8. Version History & Iteration Mode
A dedicated diffing engine for prompt engineering.
- **Snapshotting**: Every compilation automatically snapshots the state (Prompt + Active Rules).
- **Iteration View**: A side-by-side or unified diff view comparing `v-current` with `v-previous`.
- **Quality Delta**: The UI highlights not just text changes, but *metric changes* (e.g., "Clarity Score +12%", "Token Usage -15%").
- **Time Travel**: A single click on "Revert to this snapshot" instantly restores the Editor and Rules to that exact state.

## 9. Workspace Search
A universal, intelligent search accessible from anywhere (e.g., `Cmd + P`).
- **Scope**: Instantly searches across:
  - Current prompt text.
  - Historical prompts (across all projects).
  - The Rule Library (e.g., typing "auth" surfaces both your past auth prompts and the "Authentication Rule").
- **Preview**: Arrowing through results shows a rich preview in an adjacent pane without leaving the search context.

## 10. Command Center
The central nervous system for execution, replacing scattered buttons.
- **Omni-Action Bar**: A unified bar (or palette) that accepts semantic commands.
- **Quick Actions**: "Compile with Gemini 3.6", "Run Strict Validation", "Optimize for length", "Duplicate to new project".
- **Keyboard-First**: Fully navigable without a mouse, allowing power users to execute complex chains (e.g., Compile -> Validate -> Export) via shortcuts.

## 11. Focus Mode
A Zen-like environment for deep thinking and drafting.
- **Trigger**: A single shortcut or toggle switch.
- **Behavior**: Sidebar collapses, panels fade away, leaving only the Prompt Editor centered on the screen. The AI Assistant turns into a minimal ambient indicator.
- **Exiting**: A subtle hover zone at the screen edges reveals the panels temporarily, or hitting `Esc` restores the full workspace.

## 12. Collaboration UX (Future-Ready)
Preparing the UI architecture for multiplayer prompt engineering.
- **Presence Indicators**: Subtle avatars in the top right corner indicating active viewers.
- **Threaded Comments**: The ability to highlight a specific block in the Prompt Inspector and attach a comment (e.g., "Is this constraint too strict?").
- **Review Mode**: A staging area where a junior prompt engineer can submit a prompt for approval before it is exported to the production codebase.

## 13. Complete User Flow
1. **Initiation**: User opens a project. The workspace restores their last known layout (e.g., Editor Left, Inspector Right).
2. **Drafting**: User types in the Editor. The Smart Context panel updates live, showing token limits.
3. **Assistance**: The AI Assistant gently pulses, suggesting a missing security rule based on the drafted text. User clicks "Apply".
4. **Execution**: User hits `Cmd + Enter`. The Timeline creates a new node, showing the compiling stages.
5. **Review**: The Prompt Inspector renders the output. User enters Iteration Mode to compare it against yesterday's draft.
6. **Export**: User opens the Command Center (`Cmd + K`), types "Export JSON", and copies the payload.

## 14. Interaction Diagrams
- **Panel Snap**: User dragging panel -> Ghost outline appears -> Drop -> Adjacent panels auto-resize.
- **Diff View Toggle**: Clicking a History node -> Main Stage splits vertically -> Left shows V1, Right shows V2 with highlighting.
- **Context Reveal**: User hovers over a highlighted rule in the Inspector -> A tooltip popover displays the full rule text and origin.

## 15. Future Scalability
- **Plugin Ecosystem**: The panel architecture allows third-party integrations (e.g., a "Jira Integration" panel or a "GitHub Copilot" rule sync panel) to snap in seamlessly.
- **Custom Perspectives**: The ability for teams to save and share workspace layouts (e.g., "The Debugging Layout", "The Drafting Layout").
- **Telemetry**: The Timeline and Context Panel are built to ingest an increasing amount of metadata as AI engines become more complex, without cluttering the core UI.
