# Chat UI Design Reference — chatbot-embedded-event-trail-mockup.html

## Key Design Patterns

### Vertical Timeline Line
- CSS background gradient on `.chat-scroll`: `linear-gradient(90deg, transparent 0 33px, #e8eef5 33px 34px, transparent 34px 100%)`
- Line is at x=33px from left edge of scroll area
- Padding: `padding: 20px 20px 120px 18px` (left 18px so line sits at 33px = 18+15)

### Thread Items
- Grid: `grid-template-columns: 32px 1fr; gap: 13px`
- Node dot: `width:18px; height:18px; border-radius:50%; margin-left:24px; margin-top:10px; transform:translateX(-50%)`
- Dot sits ON the line (margin-left:24px + translateX(-50%) = 24-9=15px from left of col = 18+15=33px from scroll edge)

### Dot Colors
- `.node-dot::after { background: #94a3b8 }` — default grey
- `.node-dot.user::after { background: #111827 }` — dark/black for user
- `.node-dot.assistant::after { background: #2563eb }` — blue for AI
- `.node-dot.event::after { background: #10b981 }` — green for events
- `.node-dot.warning::after { background: #f59e0b }` — orange for warnings

### Event Cards (compact single-line)
- `.event-card`: border, rounded-16px, min-height:44px, flex, justify-between
- Icon colors by type:
  - `.opened`: blue icon bg `#e8f0ff`
  - `.ran`: green icon bg `#e9fbf4`
  - `.warning`: orange icon bg `#fff7e6`
  - `.approval`: purple icon bg `#f2eaff`

### Surface Card (embedded worksheet)
- `.surface-card`: border, rounded-22px, overflow:hidden, margin-top:12px, box-shadow
- `.surface-top`: 54px height, flex, border-bottom, padding 0 14px, bg #fbfdff
- Mini icon: 32px, rounded-12px, bg #111827 (dark)
- Action buttons: ghost-btn style (height:30px, border, rounded-10px)
- Body: grid 1fr 250px (worksheet + source trace side panel)

### Composer (input bar)
- Position absolute, bottom:0, height:104px
- Left padding: 63px (aligns with content, not the timeline)
- Bar: height:56px, border-radius:20px, grid 4 cols

### Bubbles
- User: bg #111827, color white, width max-content, max-width 70%, justify-self end
- Assistant: width 100%, bg white, border #e1e7ef, border-radius 22px
- Meta line: name + dot-sep + action description

### Right Side Panel
- 300px wide, shows "Current task state" + "Surfaces opened by chat"
- NOT the main event trail — just a summary

## InScope Adaptations
- Brand colors: PURPLE #6B21A8, ORANGE #C2410C (instead of blue #2563eb)
- Background: white/light grey (not the blue gradient)
- Font: DM Sans / system-ui
- Assistant dot: use purple instead of blue
- Keep greyscale for most UI, colors only for status

## Scope Button Popover (IMPLEMENTED)
- Scope map overlay REMOVED
- Scope button click → compact popover above the bar
- Items: Workflow Builder (/builder), Dashboards (/dashboard)
- Workflow Builder removed from sidebar nav

## Contextual Workflow Actions (IMPLEMENTED)
- Appear below last assistant message in thread (not in bar)
- FAPI: Open Worksheet, Send IRL, Review Exceptions, Export PDF
- T1134: Open T1134 Form, Review Part II, Send to Partner
- Surplus: Open Surplus Calc, Review Adjustments
- Provision: Open Provision Model, Review Estimates
- Default: View Documents, Add Note, Export

## SCOPE LOGO — NEVER CHANGE
- 80px neumorphic circle, var(--is-surface) bg, var(--is-shadow-out) shadow
- 24 outer purple (#6B21A8) breathing dots rotating CW 14s, r=34
- 16 inner orange (#C2410C) breathing dots rotating CCW 9s, r=24
- Label: 'Scope' 11px bold centered
- Keyframes: sb-cw (CW 14s), sb-ccw (CCW 9s)
