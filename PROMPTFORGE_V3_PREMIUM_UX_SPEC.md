# PromptForge v3 - Premium UX & Micro-Interaction Enhancement Specification

## 1. Micro-Interaction Catalog
Every interaction in PromptForge should feel tactile, immediate, and high-fidelity, matching the caliber of tools like Cursor or Linear.

- **Hover (Buttons/Cards)**: Subtle background shift (`bg-slate-800` to `bg-slate-700`). Duration: 150ms. Easing: `ease-out`. No heavy scaling to avoid layout shifts.
- **Press (Active State)**: Immediate 0.98x scale down (`scale-98`) with a slight darkening of the background. Snaps back on release with a spring physics feel.
- **Focus (Input/Keyboard)**: Smooth 2px solid ring (`ring-2 ring-indigo-500/50`) appearing with a 100ms fade.
- **Typing (Omni-Box)**: The textarea expands fluidly as text wraps. If using AI auto-complete, suggestions appear with a soft fade-in (`opacity-0` to `opacity-50`) in a muted slate color.
- **Copy Action**: Clicking a "Copy" icon instantly changes the icon to a green Checkmark (`CheckCircle`), scaling up 1.1x briefly, then reverting after 2000ms.
- **Exporting**: A soft glowing border travels around the export button indicating processing, resolving to a subtle success pulse.

## 2. Motion Design System
Motion should never impede the user's workflow. It must feel snappy, intentional, and spatial.

- **Duration Scale**:
  - Micro (Hovers, Toggles): 100ms
  - Small (Modals, Popovers): 200ms
  - Medium (Page Transitions, Sheets): 300ms
  - Large (Onboarding Tours): 500ms
- **Easing Curves**:
  - Standard/Enter: `cubic-bezier(0.16, 1, 0.3, 1)` (Swift entry, gentle settling).
  - Exit: `cubic-bezier(0.4, 0, 1, 1)` (Accelerates out of view).
- **Reduced Motion**: All animations must respect `prefers-reduced-motion: reduce` by replacing scaling/sliding with instant transitions or simple cross-fades.

## 3. Engine Execution Experience (Loading System)
Abandon generic spinners. Execution is a narrative event.

- **The Timeline**: Instead of blocking the UI, a vertical stepper appears.
- **Stages**:
  1. *Initializing Project* (Faded text, pulse dot)
  2. *Analyzing Context* (Active, glowing border)
  3. *Planning Architecture*
  4. *Running Validation*
  5. *Optimizing Output*
  6. *Completed* (Turns Emerald Green)
- **Visuals**: As each stage becomes active, it slides slightly to the right (`translateX(4px)`), its text brightens to `#FFF`, and a subtle glowing gradient track connects it to the previous step.
- **Skeleton Loading**: For historical projects or heavy data fetches, use skeleton screens that shimmer elegantly (`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900`) matching the exact shape of the expected content.

## 4. Notification System
Notifications should inform without interrupting.

- **Toast System**: Unobtrusive toasts anchored to the bottom-right (desktop) or top-center (mobile).
- **Styles**:
  - *Info*: Slate background, Blue icon.
  - *Success*: Slate background, Emerald icon.
  - *Warning*: Slate background, Amber icon.
  - *Error*: Slate background, Red icon with subtle red border.
- **Behavior**: Toasts slide up (`translateY(20px)` to `0`) and fade in. They auto-dismiss after 4000ms unless hovered. They stack gracefully with a slight scale-down of older toasts.

## 5. Empty State System
Empty states must be beautiful and actionable, never just a blank screen.

- **Projects**: A subtle wireframe illustration of a blueprint. Action: "Create your first project" (Primary Button) + 3 Quick-start templates.
- **History**: A muted clock icon. Text: "No compiled prompts yet. Run a compilation to see your history."
- **Rules/Validation**: A shield icon. Text: "Run the compiler to inspect applied intelligence rules."
- **Design**: Empty states use low-opacity (`opacity-40`) iconography and muted typography (`text-slate-500`) to clearly indicate absence without looking broken.

## 6. Error Handling UX
Errors must be clear, actionable, and non-destructive.

- **Inline Errors**: For input validation, highlight the field with a red ring and place a small, clear message below it.
- **Compiler/Engine Failures**: Do not wipe the user's prompt. Display a contextual banner above the timeline: "Optimization Engine Timeout." Include a clear "Retry" button. Provide a link to "View Logs" for technical details.
- **Network Failures**: Subtle offline indicator in the header. Actions cache locally until the network is restored.

## 7. Success Feedback UX
Success should be confirmed subtly.

- **Prompt Compiled**: The output pane gently flashes a highly transparent emerald overlay (150ms). The text streams in fluidly rather than appearing instantly in one jarring block.
- **Validation Passed**: A checkmark icon ripples outwards softly.
- **Project Saved**: A tiny "Saved" indicator appears next to the project title, fading out after 2 seconds.

## 8. Command Palette Design
A central hub for power users, invoked via `Cmd + K` (Mac) or `Ctrl + K` (Win).

- **UI**: A centered modal with a blurred backdrop (`backdrop-blur-sm`). Dark slate background, distinct from the main app.
- **Sections**:
  - *Recent Projects*
  - *Actions* (New Prompt, Export, Compile)
  - *Engines* (Switch to v2, Switch to v3)
  - *Navigation* (Go to Settings, Go to Playground)
- **Interaction**: Fully keyboard navigable. Arrow keys to move, Enter to select. Instant fuzzy search filtering.

## 9. Keyboard Shortcut Strategy
Empower experienced users to navigate without a mouse.

- `Cmd + Enter`: Compile the current prompt.
- `Cmd + S`: Save project.
- `Cmd + Shift + E`: Export current output.
- `Cmd + K`: Open Command Palette.
- `Cmd + /`: Toggle sidebar / focus editor.
- `Esc`: Close any active modal, toast, or rule inspector panel.
- **Discoverability**: Shortcuts are displayed faintly in tooltips and menus.

## 10. Onboarding Flow
Elegant, skip-able, and integrated into the app.

- **Welcome Modal**: A clean, single-screen modal introducing PromptForge v3's new AI-first philosophy.
- **Interactive Tour**: 3 non-intrusive pulsating dots indicating core features (The Omni-Box, The Timeline, The Export Button).
- **First Prompt Guide**: A ghostly placeholder in the Omni-Box demonstrating a high-quality input: "e.g., Build a secure Express API with..."
- **Escape Hatch**: Always provide a clear "Skip Tour" button.

## 11. Search Experience
Global, intelligent, and instantaneous.

- **Integration**: Search is baked into the `Cmd + K` Command Palette.
- **Results**: Grouped by category (Projects, Rules, History).
- **Preview**: Highlighting matching text in the search results.
- **Speed**: Results update on every keystroke (debounced 150ms) without hitting the server for local history.

## 12. Accessibility Improvements
A premium tool is accessible to everyone.

- **Focus Indicators**: Every interactive element must have a visible focus state (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- **Screen Readers**: Use `aria-live="polite"` for the Execution Timeline to announce progress ("Analyzing context... Optimizing output...") without interrupting the user.
- **Contrast**: Ensure all text, especially muted helper text (`text-slate-500`), passes WCAG AA contrast ratios against the dark background.
- **Keyboard Traps**: Ensure modals and the Command Palette trap focus correctly and can be dismissed with `Esc`.

## 13. Premium UX Recommendations
- **Sound Design**: Consider *extremely* subtle, optional audio cues for compilation success or errors (similar to high-end productivity tools), disabled by default.
- **Haptics (Mobile)**: Use the device's tactile feedback engine for success states (light pop) or errors (double buzz).
- **Fluid Output**: When the compiled prompt is generated, reveal it with a smooth masking animation or a fast typing effect to make the AI feel alive, rather than snapping text into the DOM instantly.
