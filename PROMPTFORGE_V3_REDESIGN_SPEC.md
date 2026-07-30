# PromptForge v3 - AI-First UI/UX Redesign Specification

## 1. Design Philosophy
The redesign of PromptForge shifts from a complex, dashboard-heavy developer tool to a serene, AI-first conversational interface. Inspired by modern LLM interfaces (ChatGPT, Claude, Gemini, Cursor), the philosophy centers on:
- **Prompt-Centricity**: The editor is the hero of the screen.
- **Clarity over Density**: Removing visual noise, nested menus, and aggressive borders.
- **Premium Minimalism**: Using generous whitespace, refined typography, and subtle contrast to convey power without overwhelming the user.
- **Progressive Disclosure**: Advanced features (Engines, Rules, Validation) are available on demand but hidden by default to keep the primary workspace clean.

## 2. Information Architecture
The application is flattened. Complex nested routes are replaced with context-aware panels.
- **Landing (Zero State)**: Welcoming entry point for new prompts.
- **Workspace (Active State)**: The main editor + execution timeline + split preview.
- **Global Config**: Accessible via the minimal sidebar (Settings, Global Rules, Engine Config).

## 3. Navigation Structure
A highly minimal, collapsible left sidebar (or bottom bar on mobile).
- **Home / New Project** (Primary action)
- **Recent Projects**
- **Playground**
- **Engines**
- **Rules Index**
- **Analytics**
- **Settings**

## 4. Layout Specification
The application adopts a responsive, flex-based fluid layout that adapts gracefully from ultra-wide monitors to mobile devices, ensuring the prompt editor remains the focal point across all breakpoints.

## 5. Design System
- **Color Palette (Dark-First)**:
  - Background (App): `#0F1115`
  - Background (Surface/Card): `#161920`
  - Background (Editor/Input): `#1C2028`
  - Text (Primary): `#F1F3F5`
  - Text (Secondary/Muted): `#8B949E`
  - Accent (Primary): `#5D5CFF` (Vibrant Indigo)
  - Accent (Success): `#2EA043`
  - Accent (Warning): `#D29922`
  - Border/Divider: `#21262D`
- **Typography**: Primary: *Geist* or *Inter*. Monospace: *Geist Mono* or *JetBrains Mono*. H1: 24px, Body: 15px, Small: 12px.
- **Spacing & Grid**: 8px base unit. 
- **Border Radius**: 12px for surfaces/cards, 8px for buttons, 16px for the main editor wrapper.
- **Elevation**: Flat design. Rely on subtle borders (`1px solid #21262D`).
- **States**: Subtle hover (`bg-opacity-80`), clear focus rings (2px solid `#5D5CFF`), disabled (`opacity-50`).

## 6. Component Catalog
- **The "Omni-Box" (Input)**: Large, auto-expanding textarea, zero borders, inner glow on focus. Includes Attachment and Voice buttons.
- **Execution Timeline**: Vertical stepper: `[✓] Analyzed`, `[O] Applying Rules (pulsing)`, `[ ] Optimizing`.
- **Rule Inspector Card**: Interactive card showing Applied Rules, Reason, Priority, Source, Dependencies.
- **Floating Action Bar**: Appears near text selection (Format, Refine).
- **Button/Pill**: Minimalist padding, rounded corners, soft backgrounds.

## 7. Screen-by-Screen Breakdown
- **Landing Page**: Logo top left. "What are we building today?" (H1) centered. Omni-Box in the middle third. Suggested templates below.
- **Workspace**: Split view. Left: Omni-Box at the bottom, chat-style. Right: Compiled Blueprint and Execution Timeline.
- **Rule Inspector (Slide-out)**: List of applied rules formatted as interactive cards explaining why they activated.

## 8. Desktop Layout (1024px+)
- **Sidebar**: Fixed left, 260px wide, collapsible to 60px (icon-only).
- **Main Stage**: Centered content column (max-width: 800px) for the editor.
- **Inspector Panel**: Slide-out right panel (400px) for Timeline and Validation, appearing only when executing.

## 9. Tablet Layout (768px - 1023px)
- **Sidebar**: Hidden behind a hamburger menu (slide-over drawer).
- **Main Stage**: Takes up full width with comfortable padding (32px).
- **Inspector Panel**: Overlays the main stage when triggered as a side sheet.

## 10. Mobile Layout (< 768px)
- **Bottom Navigation**: Home, Projects, Engines, Settings (Large touch targets, minimum 44px).
- **Main Stage**: Full width, optimized for touch typing and voice dictation.
- **Inspector Panel**: Slides up as a bottom sheet.

## 11. Animation Guidelines
- **Micro-interactions**: 150ms ease-in-out for button hovers (background color shifts).
- **Page Transitions**: 250ms gentle fade and slight upward slide (10px).
- **Execution**: Timeline items fade in sequentially. A subtle glowing gradient tracks the currently active engine. Avoid bouncy physics.

## 12. Accessibility Considerations
- **Contrast**: Pass WCAG AA (minimum 4.5:1 ratio).
- **Focus States**: Clear, visible focus rings on all interactive elements.
- **Screen Readers**: `aria-live` regions for the execution timeline to announce status changes without requiring visual focus.

## 13. User Journey
1. **Entry**: User opens PromptForge. Greets with a clean, centered input box.
2. **Drafting**: User types their idea. The UI remains distraction-free.
3. **Execution**: User hits `Cmd+Enter`. The input slides down, and a vertical Execution Timeline appears, narrating the AI's thought process (Rules, Validation, Optimization).
4. **Review**: The compiled prompt appears in a beautiful Markdown view.
5. **Inspection**: User clicks a rule badge to see why it was applied.
6. **Export**: User clicks the "Export" icon (top right) to copy or download.

## 14. UX Improvements
- **Reduced Cognitive Load**: Moving from a multi-panel dashboard to a single conversational flow.
- **Transparency**: The Execution Timeline makes the "black box" of the Compiler and Engines visible and understandable.
- **Contextual Actions**: Actions (Export, Validate) only appear when relevant.

## 15. Final Implementation Recommendations
- **Styling**: Use **Tailwind CSS v4** for exact color tokens and spacing scale enforcement.
- **Motion**: Use **Framer Motion** for the subtle entry and layout animations (especially the Omni-Box shifting).
- **Architecture**: Implement the UI using React Server Components or lightweight client-side state to keep interactions instantaneous.
- **Layout**: Replace all heavy grid layouts with flexbox-centric, fluid container designs.
