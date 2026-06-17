# Design

## Theme

Dark. A PM reviewing items, triaging deadlines, logging decisions — often in a focused work session on a lit monitor. The dark surface reduces ambient distraction and keeps the content (text, statuses, dates) visually primary.

## Color Strategy

Restrained. One accent (teal) at under 10% of surface area. Blue-gray neutrals tinted toward the accent hue so the palette coheres without effort. Status colors carry semantic weight and appear only on badges and timeline dots.

## Color Palette

Base and surface use OKLCH to keep the tint honest across displays.

| Role | OKLCH | Hex approx | Usage |
|---|---|---|---|
| Background | `oklch(14% 0.006 240)` | ~#1a1b1f | App background (50% of surface) |
| Surface | `oklch(16% 0.007 240)` | ~#1e2025 | Panels, cards (30%) |
| Surface raised | `oklch(18% 0.008 240)` | ~#22242b | Selected rows, hover states |
| Border subtle | `oklch(20% 0.008 240)` | ~#262830 | Panel dividers |
| Border default | `oklch(25% 0.009 240)` | ~#2e3038 | Input borders, component edges |
| Text primary | `oklch(94% 0.005 240)` | ~#eeeef2 | Headings, item titles |
| Text secondary | `oklch(72% 0.008 240)` | ~#aeb0bc | Labels, metadata |
| Text muted | `oklch(45% 0.007 240)` | ~#686a78 | Placeholder, disabled, timestamps |
| Text dim | `oklch(32% 0.006 240)` | ~#484a55 | Struck-through done items |
| Accent (teal) | `oklch(72% 0.14 195)` | ~#2dd4bf | Active states, links, focus rings, BU chips |
| Accent subtle | `oklch(22% 0.05 195)` | ~#1a2e2c | Teal badge background |
| Danger | `oklch(68% 0.18 25)` | ~#f87171 | Overdue dates, delete hover |
| Danger subtle | `oklch(20% 0.05 25)` | ~#2d1f1f | Overdue badge background |

Status badge colors (semantic, used on badges and activity dots):

| Status | Color | Background tint |
|---|---|---|
| Backlog | `oklch(52% 0.01 240)` / `#71717a` | 15% opacity |
| In Progress | `oklch(76% 0.16 70)` / `#f59e0b` | 15% opacity |
| In Review | `oklch(66% 0.18 270)` / `#818cf8` | 15% opacity |
| Done | `oklch(72% 0.14 195)` / `#2dd4bf` | 15% opacity |

## Typography

System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. No web fonts loaded — instant render, no layout shift.

| Scale | Size | Weight | Usage |
|---|---|---|---|
| Item title | 13px | 600 | Right panel item title (editable) |
| Body | 12px | 400 | Conversation bubbles, descriptions |
| Label | 11px | 500 | Item card titles, project names, tab labels |
| Small | 10px | 400 | Deadlines, item metadata, status dropdown |
| Micro | 9px | 500 | Section headers (uppercase + tracked), timestamps |
| Tiny | 8–9px | 600 | Badge text |

Letter-spacing: section labels use `0.10–0.12em` tracked uppercase. Everything else: default.

Line height: body 1.6, labels 1.3, tight UI elements 1.

## Spacing

Base unit: 4px. Rhythm varies — same padding everywhere reads as monotony.

| Context | Value |
|---|---|
| Panel padding (left/right) | 12–16px |
| Section gap | 8–12px |
| Row padding (items, projects) | 6–7px vertical, 12px horizontal |
| Tab padding | 8px vertical, 12px horizontal |
| Inline form gap | 4–6px |
| Content area padding | 16px |

## Elevation

No shadows. Separation is via background tone and border. Three levels:

1. Background `oklch(14%)` — app canvas
2. Surface `oklch(16%)` — panels, sidebars
3. Surface raised `oklch(18%)` — selected rows, focused inputs, hover states

## Components

### Left border selection pattern

Active rows (projects, items) use a 2px left border in accent teal + surface-raised background. No other selection affordance.

```
border-left: 2px solid oklch(72% 0.14 195)
background: oklch(18% 0.008 240)
```

Non-selected: `border-left: 2px solid transparent` to preserve layout width.

### Badges

Pill shape (`border-radius: 20px`), 9px text, 600 weight. Background is the status color at ~15% opacity; foreground is the status color at full lightness. Applied via inline `style` since colors are dynamic.

```
background: ${color}26   // ~15% hex alpha
color: ${color}
```

### Filter chips

Same pill shape as badges. Active: accent background + white text. Inactive: `border: 1px solid border-default`, muted text.

### Inputs

Transparent background, bottom-border only on focus (no box). Focus border: accent teal. Placeholder: text-muted. No border at rest.

```
bg-transparent border-b border-transparent focus:border-teal-500
```

For form fields (inline add forms): subtle surface background, full border, focus switches border to teal.

### Overdue indicator

Date text shifts to danger red. No icon, no badge — the color is the signal.

```
color: oklch(68% 0.18 25)   // danger
```

For item cards, a small pill badge with danger-subtle background:
```
background: oklch(20% 0.05 25)
color: oklch(68% 0.18 25)
```

### Focus rings

`:focus-visible` only. Accent teal, 2px offset.

```css
:focus-visible { outline: 2px solid oklch(72% 0.14 195); outline-offset: 2px; }
```

### Delete affordance

Hover-reveal ✕ button (opacity-0 → opacity-100 on group-hover). Color shifts from text-muted to danger on its own hover.

### Toast

Fixed bottom-right. Success: accent-subtle background + accent text. Error: danger-subtle + danger text. Auto-dismisses after 3s.

## Motion

Minimal. `transition-colors` (150ms) on interactive elements. No layout animation. No bounce, no spring. Ease-out only.

## Layout

Three-panel fixed layout. No scroll on the shell — each panel scrolls internally.

| Panel | Width | Notes |
|---|---|---|
| Left | 192px | BU selector + project list + docs |
| Middle | 224px | Item list + status filter |
| Right | flex: 1 | Item detail — header + tabs + content |

TopBar: 40px, full width, `shrink-0`.
