# Aside AI Thread Design Spec

## Overall
- Pure white (#FFFFFF) background, no gradients, no borders on main area
- Single-column vertical feed, content indented right to make room for left spine
- Ultra-minimalist, clean, heavy negative space (Notion/Linear aesthetic)

## Left Spine
- Thin 1–2px light gray vertical line, continuous, runs full height
- Active step: bright blue filled circle ~8px diameter + semi-transparent blue halo/pulse ring ~24px
- Dot moves down to align with the newest active step

## Typography
- Action/step titles: 24–28px, regular-to-medium weight, dark gray/black
- Body text: 16–18px, regular weight, dark gray, line-height 1.5
- Secondary/meta: 14–16px, medium gray #888

## Components
- NO chat bubbles — everything is open text on white
- Action steps: icon on left (wireframe/monochrome), large title text, chevron to expand/collapse
- Embedded content (worksheets, cards): rounded corners 8–12px, subtle drop shadow, indented to align with text
- List items: icon | bold name | gray context | right-aligned timestamp

## Spacing
- Left edge to spine line: ~30px
- Spine line to content icons: ~30px  
- Icons to text: ~16px
- Between major sections: 60–80px
- Within a list: 16–24px

## Animation
- Content populates sequentially top-to-bottom
- Blue dot drops to anchor viewer's eye to newest action
- Embedded content expands downward inline, pushing subsequent steps down
- Text renders inline below its action header

## Key differences from current design
- Remove all chat bubbles (dark user bubble, white assistant bubble)
- Remove the timeline dot system (colored dots on left)
- Replace with: spine line + large action titles + body text
- User messages: just plain text, slightly indented, maybe a small "you" label
- Assistant messages: step title (icon + large text) + body paragraph below
- Event cards: become inline step items on the spine, not separate card components
