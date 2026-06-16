# PM Tracker — Design Spec
_Date: 2026-06-17_

## Overview

PM Tracker is a local-first, single-user project management web app for PMs. Think of it as a personal PM diary — a place to track work, log decisions, capture conversations, and maintain clarity across multiple projects, without cloud accounts or shared infrastructure.

Deployable as a static site to GitHub Pages or nikhilthomasa.in. All data lives in the browser's `localStorage`. A JSON export/import mechanism handles backup and restore.

---

## Goals

- Give a PM one place to track all their work end-to-end
- Make it easy to log conversations, decisions, and progress on each item as they happen
- Be genuinely usable, not just a portfolio demo
- Work offline, require no login, no backend

---

## Non-Goals (V1)

- Multi-user collaboration or sharing
- File upload / binary attachments (links only)
- AI-generated summaries (noted for later)
- Mobile layout (desktop-first)
- Per-project custom status columns (reserved for V2)

---

## Hierarchy

Four levels, each nested inside the one above:

```
Business Unit
  └── Project
        └── Item
              └── Sub-task
```

- **Business Unit** — top-level organisational division (e.g. "Engineering", "Marketing"). A Project can belong to multiple BUs but typically belongs to one.
- **Project** — a discrete body of work within a BU. Has its own Docs & Links section.
- **Item** — a feature, task, or deliverable within a Project. Has the full workflow: status, deadline, conversation, links, and activity log.
- **Sub-task** — a simple checkbox under an Item. No status, no deadline, no conversation of its own.

---

## Data Model

All data is stored in `localStorage` as serialised JSON under a single `pmtracker_data` key.

### BusinessUnit
```ts
{
  id: string           // uuid
  name: string
  description: string
  createdAt: string    // ISO 8601
}
```

### Project
```ts
{
  id: string
  name: string
  description: string
  businessUnitIds: string[]          // typically one, supports multiple
  docs: { id: string; label: string; url: string }[]
  createdAt: string
  updatedAt: string
}
```

### Item
```ts
{
  id: string
  projectId: string
  title: string
  description: string
  statusId: string                   // references a Status
  deadline: string | null            // ISO date or null
  links: { id: string; label: string; url: string }[]
  createdAt: string
  updatedAt: string
}
```

### SubTask
```ts
{
  id: string
  itemId: string
  title: string
  done: boolean
  createdAt: string
}
```

### ConversationEntry
```ts
{
  id: string
  itemId: string
  content: string    // rich text stored as HTML (from Tiptap)
  createdAt: string
}
```

### ActivityEntry (auto-generated, never user-written)
```ts
{
  id: string
  itemId: string
  type: 'item_created' | 'status_changed' | 'subtask_checked' | 'subtask_unchecked'
       | 'deadline_set' | 'deadline_cleared' | 'link_added' | 'link_removed'
       | 'note_added'
  description: string   // human-readable, e.g. "Status changed: In Progress → In Review"
  createdAt: string
}
```

### Status
```ts
{
  id: string
  label: string
  color: string         // hex, used for badge colour
  scope: 'global' | 'project'
  projectId?: string    // only set when scope === 'project'
  isDefault: boolean    // true for the 4 built-ins (non-deletable)
  order: number         // controls display order in filter tabs
}
```

**Default statuses (seeded on first launch, global, non-deletable):**

| Label | Color |
|---|---|
| Backlog | #71717a |
| In Progress | #f59e0b |
| In Review | #6366f1 |
| Done | #14b8a6 |

---

## Layout

Three-panel layout, always visible on desktop (min-width: 1024px).

```
┌─────────────────────────────────────────────────────────────┐
│  PM Tracker                         ↓ Export    ↑ Import    │  ← top bar
├──────────────┬────────────────────┬────────────────────────┤
│  LEFT PANEL  │   MIDDLE PANEL     │    RIGHT PANEL         │
│  190px       │   230px            │    flex: 1             │
│              │                    │                        │
│  BU tabs     │  Project title     │  Item title + status   │
│  ──────────  │  Status filters    │  Deadline              │
│  Projects    │  ──────────────    │  ──────────────────    │
│  (filtered   │  Item cards with   │  Tabs:                 │
│   by BU)     │  status badges     │  Sub-tasks │ Convo     │
│  ──────────  │  + subtask count   │  Links     │ Activity  │
│  Docs &      │  + deadline        │                        │
│  Links for   │                    │                        │
│  active      │                    │                        │
│  project     │                    │                        │
└──────────────┴────────────────────┴────────────────────────┘
```

### Left Panel
- BU selector at the top (tabs or a compact dropdown if > 4 BUs)
- Projects list filtered by selected BU; active project highlighted with teal left-border
- Below the projects list: **Docs & Links** section for the active project — labelled URLs, "+ Add link"
- Bottom: "+ New Project"

### Middle Panel
- Active project name as heading
- Status filter tabs (All + each status); clicking filters the item list
- Item cards: title, status badge, deadline (if set), subtask progress (e.g. "3/5")
- Done items shown last, titles struck through at reduced opacity
- Bottom: "+ New Item"

### Right Panel
- Item title (editable inline), status dropdown (top-right)
- Deadline field (date picker)
- Four tabs: **Sub-tasks**, **Conversation**, **Links**, **Activity**

#### Sub-tasks tab
- Checklist of sub-tasks; checking one fires an ActivityEntry automatically
- Done sub-tasks shown struck-through at reduced opacity
- "+ Add sub-task" at the bottom

#### Conversation tab
- Chronological list of entries, newest at bottom
- Each entry: timestamp header + chat-bubble styled card
- Rich text bubble: supports bold, italic, underline, links, bullet lists (via Tiptap)
- Compose area at the bottom: mini toolbar + text area + "Add entry" button
- Adding an entry auto-creates an ActivityEntry of type `note_added`

#### Links tab
- Simple list of labelled URLs specific to this Item
- Each row: label + URL + delete button
- "+ Add link" opens a small inline form (label + URL)
- Adding/removing a link auto-creates an ActivityEntry

#### Activity tab
- Reverse-chronological timeline (newest at top)
- Coloured dot per event type:
  - Teal → status change
  - Indigo → subtask checked/unchecked
  - Amber → note added
  - Pink → link added/removed
  - Orange → deadline set/cleared
- Timeline connector line between dots
- Read-only — never user-editable

---

## Status Management

Accessible via a **Settings** page (gear icon in the top bar).

- Lists all statuses in order; drag to reorder
- "+ New Status" opens an inline form: label, colour picker, scope toggle (Global / This project)
- Default statuses (Backlog, In Progress, In Review, Done) show a lock icon — label/colour editable, but cannot be deleted or scoped to a single project
- Custom statuses can be deleted only if no Items currently hold that status

---

## Colour System (Theme B — Warm Charcoal + Teal)

| Role | Token | Hex |
|---|---|---|
| Background (50%) | `bg-base` | `#18181b` |
| Surface / panels (30%) | `bg-surface` | `#27272a` |
| Borders | `border` | `#3f3f46` |
| Accent (20%) | `accent` | `#14b8a6` |
| Text primary | `text-primary` | `#fafafa` |
| Text muted | `text-muted` | `#71717a` |
| Text secondary | `text-secondary` | `#a1a1aa` |

Status badge colours are defined per Status record (see defaults above).

---

## Backup & Restore

- **Export:** clicking "↓ Export backup" downloads `pmtracker-backup-YYYY-MM-DD.json` — a single JSON object containing all entities
- **Import:** clicking "↑ Import" opens a file picker; selecting a valid `.json` file replaces all current data after a confirmation prompt ("This will overwrite all current data. Continue?")
- The import JSON is validated for schema shape before applying; malformed files show an error toast

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React (latest stable) + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Rich text | Tiptap (headless, minimal extensions: Bold, Italic, Underline, Link, BulletList) |
| State | React Context + `useReducer` (no external state lib) |
| Persistence | `localStorage` via a thin `storage.ts` module |
| Date formatting | `date-fns` |
| IDs | `crypto.randomUUID()` |
| Deployment | `vite build` → `dist/` → GitHub Pages or nikhilthomasa.in |

No router needed — navigation is pure component state (selected BU / Project / Item).

---

## Component Tree (top-level)

```
App
├── TopBar (logo, export, import, settings link)
├── ThreePanel
│   ├── LeftPanel
│   │   ├── BuSelector
│   │   ├── ProjectList
│   │   │   └── ProjectListItem (×n)
│   │   └── ProjectDocsLinks
│   ├── MiddlePanel
│   │   ├── StatusFilterTabs
│   │   ├── ItemList
│   │   │   └── ItemCard (×n)
│   │   └── NewItemButton
│   └── RightPanel
│       ├── ItemHeader (title, status dropdown, deadline)
│       ├── TabBar
│       └── TabContent
│           ├── SubTasksTab
│           ├── ConversationTab
│           │   ├── ConversationFeed
│           │   │   └── ConversationBubble (×n)
│           │   └── ConversationCompose
│           ├── LinksTab
│           └── ActivityTab
│               └── ActivityEntry (×n)
└── SettingsPage (status manager, accessible via gear icon)
```

---

## Seeding & First Launch

On first launch (empty localStorage), the app:
1. Seeds the 4 default statuses
2. Shows a "Welcome" empty state with a prompt to create the first Business Unit

---

## Future Considerations (out of scope for V1)

- AI-generated project summary from Docs & Links content
- Per-project custom status columns
- Mobile-responsive layout
- Dark/light theme toggle
- Search across all items
- Deadline notifications / reminders
