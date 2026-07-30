# PromptForge v3 - Mobile-First Responsive Redesign Specification

## 1. Mobile-First Design Philosophy
The responsive strategy for PromptForge v3 embraces a mobile-first mindset, ensuring the core conversational interface and AI prompt generation flow are effortless on a 320px screen, while progressively expanding to utilize the real estate of ultra-wide monitors. The experience must feel native, prioritizing large touch targets, thumb-reachable interactions, and stacked context over dense, multi-pane layouts.

## 2. Responsive Layout Specification
The layout abandons rigid dashboards in favor of fluid, adaptive containers.
- **Base Layout**: Single-column vertical stack (Mobile) -> Two-column hybrid (Tablet) -> Multi-pane expansive workspace (Desktop).
- **Core Principle**: Never force horizontal scrolling. All text, code blocks, and data tables must wrap or become swipeable horizontally within their own contained boundary without breaking the viewport.
- **Safe Areas**: Padding must account for mobile OS safe areas (notches, home indicators).

## 3. Breakpoint Strategy
- **Base (320px - 479px)**: Core mobile experience. Full-width containers, bottom-sheet overlays.
- **Phablet (480px - 599px)**: Expanded mobile. Slightly larger margins, maintaining single column.
- **Tablet (600px - 1023px)**: Introduction of off-canvas sidebars and split-pane views in landscape mode.
- **Desktop (1024px - 1439px)**: Persistent sidebar, dual-pane workspace (Editor + Preview).
- **Wide Desktop (1440px - 1919px)**: Expanded dual-pane, visible inspector panels.
- **Ultra-Wide (1920px+)**: Centered max-width main stage (max-w-[1600px]) to prevent excessive eye tracking.

## 4. Mobile Navigation System
- **Bottom Navigation Bar**: Fixed at the bottom of the screen with a frosted glass effect (backdrop-blur).
- **Items**: Home, Projects, Playground, History, Settings (Max 5 items).
- **Action Safe Zone**: The primary "Omni-Box" input and critical action buttons (Compile, Optimize) sit just above the bottom nav, within easy thumb reach.
- **Secondary Actions**: Menus, filters, and settings are moved to Bottom Sheets that slide up, retaining context of the current screen.

## 5. Tablet Layout
- **Navigation**: Collapsible left sidebar (drawer) accessible via a top-left hamburger menu. Bottom nav is hidden.
- **Workspace**: Adaptive. In portrait, retains a stacked layout with wider margins. In landscape, introduces a two-column view (Editor on left, Timeline/Preview on right) taking advantage of available width.

## 6. Desktop Layout
- **Navigation**: Persistent left sidebar.
- **Workspace**: Side-by-side split view. The "Omni-Box" rests at the bottom or expands to the left pane. The right pane handles the Execution Timeline, Rule Inspector, and Compiled Output.
- **Inspector**: Persistent right sidebar for deep dives on large screens.

## 7. Responsive Component Redesign
- **Buttons**: Minimum 48px height on mobile for tap targets. On desktop, scales down to 36px/40px for tighter density.
- **Omni-Box (Prompt Editor)**: Starts as a bottom-docked input on mobile (chat style). Expands upwards as the user types. Full-screen editor available via an expand toggle.
- **Recent Projects**: Horizontal scrolling cards (swipeable) on mobile to save vertical space. Grid on desktop.
- **Templates**: Swipeable chips (horizontal scroll) on mobile. Row/Grid on desktop.
- **Execution Timeline**: Vertical progress cards. Tapping a card expands it in place (accordion style) on mobile, rather than opening a side panel.
- **Rule Inspector**: Bottom sheet on mobile. Slide-out panel or persistent right column on desktop.
- **Compiled Output**: Stacked on mobile with "Copy" and "Export" FABs (Floating Action Buttons). Split-view on desktop.

## 8. Responsive Design System
- **Grid System**: 
  - Mobile: 4 columns, 16px margins, 16px gutters.
  - Tablet: 8 columns, 32px margins, 24px gutters.
  - Desktop: 12 columns, 64px margins, 24px gutters.
- **Typography Scale**: Fluid typography (`clamp()`) or discrete breakpoint scaling. 
  - H1: 24px (Mobile) -> 32px (Desktop).
  - Body: 16px (Mobile for legibility) -> 15px (Desktop for density).
- **Spacing**: Base 8px unit. Relaxed padding on mobile touch areas; tightened padding on desktop dense data areas.

## 9. UX Improvements
- **Context Preservation**: Using Bottom Sheets instead of full-page routing on mobile keeps the user grounded in their current workflow.
- **Thumb Ergonomics**: Placing the Omni-Box and primary actions in the lower half of the screen.
- **Readable Code**: Code blocks use `overflow-x-auto` with clear visual cues (e.g., a fade effect on the right edge) indicating more content.

## 10. Interaction Flow (Mobile)
1. User taps "New Project" from the bottom nav.
2. The Omni-Box is focused, keyboard pops up, box expands.
3. User types and taps "Compile" (thumb-reachable).
4. The keyboard dismisses. The screen transitions to a vertical Execution Timeline.
5. As engines complete, the timeline cards turn green.
6. The Compiled Prompt appears below the timeline.
7. User taps "Export" (sticky bottom action) to copy to clipboard.

## 11. Accessibility Improvements
- **Touch Targets**: Strict adherence to minimum 48x48 dp touch targets on all mobile interactive elements.
- **Hit Slop**: Adding padding to icons so the clickable area is larger than the visual area.
- **Font Scaling**: Support for dynamic OS font sizes without breaking the UI layout.

## 12. Performance Recommendations
- **DOM Size**: Virtualize long lists (History, Rules) to keep the DOM light on mobile devices.
- **Animations**: Prefer CSS `transform` and `opacity` over animating layout properties (`height`, `margin`) to guarantee 60fps. Remove heavy backdrop blurs on lower-end devices.
- **Lazy Loading**: Delay rendering of the Rule Inspector and Validation panels until requested by the user.

## 13. Screen-by-Screen Mobile Wireframe Descriptions
- **Home**: Logo centered top. Large Omni-Box filling the middle. "Templates" as a horizontal scrolling row of chips below the input. Bottom Nav fixed.
- **Execution View**: A vertical list. Top card: "Original Prompt" (collapsed). Middle cards: Engine Timeline (animating). Bottom area: Generated output sliding up once ready.
- **Rule Inspector Sheet**: A modal sliding up from the bottom, covering 80% of the screen. Close button top right. Scrollable list of applied rules.

## 14. Responsive Implementation Guidelines
- **CSS Framework**: Utilize Tailwind CSS breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
- **Flex/Grid**: Prefer Flexbox for 1D wrapping components and Grid for strict 2D structural layouts.
- **Container Queries**: Use `@container` for components like the Editor so they adapt to their parent pane's width, rather than the viewport, enabling seamless panel resizing on desktop.
