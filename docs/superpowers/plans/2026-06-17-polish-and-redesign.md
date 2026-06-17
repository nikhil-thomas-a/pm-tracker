# PM Tracker: Polish + Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all P0–P3 bugs and apply the Direction A (sharp/precise/calm) design system across every component.

**Architecture:** Bug fixes go into their natural files (reducer, components). The redesign is additive: CSS custom properties in `index.css`, theme tokens in `tailwind.config.ts`, then class-name sweeps per component. No new abstractions.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind CSS v3, date-fns

---

## Bug Fix Tasks

---

### Task 1: Deadline activity entries in reducer

**Files:**
- Modify: `src/context/reducer.ts` — UPDATE_ITEM case

Currently `UPDATE_ITEM` with a deadline change produces no activity. The types already define `deadline_set` and `deadline_cleared` — they're just never generated.

- [ ] **Step 1: Write the failing test**

In `src/__tests__/reducer.test.ts`, add after the existing tests:

```ts
it('generates deadline_set activity when deadline is added', () => {
  const withItem = reducer(INITIAL_STATE, { type: 'ADD_ITEM', projectId: 'p1', title: 'Test' })
  const item = withItem.items[0]
  const after = reducer(withItem, { type: 'UPDATE_ITEM', id: item.id, deadline: '2026-12-31' })
  const acts = after.activityEntries.filter(a => a.itemId === item.id)
  const deadlineAct = acts.find(a => a.type === 'deadline_set')
  expect(deadlineAct).toBeDefined()
  expect(deadlineAct?.description).toContain('2026-12-31')
})

it('generates deadline_cleared activity when deadline is removed', () => {
  const withItem = reducer(INITIAL_STATE, { type: 'ADD_ITEM', projectId: 'p1', title: 'Test' })
  const item = withItem.items[0]
  const withDeadline = reducer(withItem, { type: 'UPDATE_ITEM', id: item.id, deadline: '2026-12-31' })
  const after = reducer(withDeadline, { type: 'UPDATE_ITEM', id: item.id, deadline: null })
  const acts = after.activityEntries.filter(a => a.itemId === item.id)
  const cleared = acts.find(a => a.type === 'deadline_cleared')
  expect(cleared).toBeDefined()
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test -- --testPathPattern=reducer
```

Expected: FAIL — deadline_set activity not found

- [ ] **Step 3: Update reducer UPDATE_ITEM case**

Replace the current `UPDATE_ITEM` case in `src/context/reducer.ts`:

```ts
case 'UPDATE_ITEM': {
  const existing = state.items.find(i => i.id === action.id)
  if (!existing) return state

  const newActivities: typeof state.activityEntries = []

  if (action.deadline !== undefined && action.deadline !== existing.deadline) {
    if (action.deadline) {
      newActivities.push(createActivityEntry(action.id, 'deadline_set', `Deadline set: ${action.deadline.slice(0, 10)}`))
    } else {
      newActivities.push(createActivityEntry(action.id, 'deadline_cleared', 'Deadline cleared'))
    }
  }

  return {
    ...state,
    items: state.items.map(i =>
      i.id === action.id
        ? { ...i, ...(action.title !== undefined && { title: action.title }), ...(action.description !== undefined && { description: action.description }), ...(action.deadline !== undefined && { deadline: action.deadline }), updatedAt: nowISO() }
        : i
    ),
    activityEntries: [...state.activityEntries, ...newActivities],
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npm test -- --testPathPattern=reducer
```

Expected: PASS — all reducer tests pass

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/reducer.test.ts src/context/reducer.ts
git commit -m "feat: generate deadline_set/deadline_cleared activity entries"
```

---

### Task 2: Overdue indicator

**Files:**
- Modify: `src/utils/date.ts` — add `isOverdue` helper
- Modify: `src/components/items/ItemCard.tsx` — show red date when overdue
- Modify: `src/components/items/ItemHeader.tsx` — show red date label when overdue

- [ ] **Step 1: Write failing test**

In `src/__tests__/date.test.ts`, add:

```ts
import { isOverdue } from '../utils/date'

describe('isOverdue', () => {
  it('returns true for a past date', () => {
    expect(isOverdue('2020-01-01')).toBe(true)
  })
  it('returns false for a future date', () => {
    expect(isOverdue('2099-01-01')).toBe(false)
  })
  it('returns false for null', () => {
    expect(isOverdue(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
npm test -- --testPathPattern=date
```

Expected: FAIL — `isOverdue` is not exported

- [ ] **Step 3: Add isOverdue to date.ts**

In `src/utils/date.ts`, add:

```ts
export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date(new Date().toDateString())
}
```

- [ ] **Step 4: Run test to verify it passes**

```
npm test -- --testPathPattern=date
```

Expected: PASS

- [ ] **Step 5: Update ItemCard to show overdue state**

In `src/components/items/ItemCard.tsx`, update the deadline display:

```tsx
import { formatDate, isOverdue } from '../../utils/date'

// Inside the component, replace the deadline span:
{item.deadline && (
  <span className={isOverdue(item.deadline) ? 'text-red-400' : ''}>
    ⏰ {formatDate(item.deadline)}
    {isOverdue(item.deadline) && ' · overdue'}
  </span>
)}
```

- [ ] **Step 6: Update ItemHeader to show overdue state**

In `src/components/items/ItemHeader.tsx`, add the import and update the deadline label:

```tsx
import { isOverdue } from '../../utils/date'

// Inside the component, update the deadline label's className:
<label className={`flex items-center gap-1 ${item.deadline && isOverdue(item.deadline) ? 'text-red-400' : ''}`}>
```

- [ ] **Step 7: Commit**

```bash
git add src/utils/date.ts src/__tests__/date.test.ts src/components/items/ItemCard.tsx src/components/items/ItemHeader.tsx
git commit -m "feat: add overdue indicator (red date on past deadlines)"
```

---

### Task 3: Title onChange → onBlur in ItemHeader

**Files:**
- Modify: `src/components/items/ItemHeader.tsx`

Each keystroke dispatches `UPDATE_ITEM` which writes to localStorage. `onBlur` is correct: dispatch only when the user finishes editing.

- [ ] **Step 1: Add local state and switch to onBlur**

Replace the title `input` in `src/components/items/ItemHeader.tsx`:

```tsx
import { useState, useEffect } from 'react'

// Inside ItemHeader, add local state after the early return guard:
const [localTitle, setLocalTitle] = useState(item.title)

// Sync local state when selected item changes
useEffect(() => { setLocalTitle(item.title) }, [item.id, item.title])

// Replace the input:
<input
  value={localTitle}
  onChange={e => setLocalTitle(e.target.value)}
  onBlur={e => {
    const trimmed = e.target.value.trim()
    if (trimmed && trimmed !== item.title) {
      dispatch({ type: 'UPDATE_ITEM', id: item.id, title: trimmed })
    } else {
      setLocalTitle(item.title)
    }
  }}
  className="flex-1 text-sm font-semibold text-white bg-transparent outline-none border-b border-transparent focus:border-teal-500 transition-colors"
/>
```

- [ ] **Step 2: Run tests to verify nothing broke**

```
npm test
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/items/ItemHeader.tsx
git commit -m "fix: title input dispatches on blur not every keystroke"
```

---

### Task 4: Item description field

**Files:**
- Modify: `src/components/items/ItemHeader.tsx` — add description textarea below title row

- [ ] **Step 1: Add description textarea**

In `src/components/items/ItemHeader.tsx`, after the `useEffect` for title sync, add description state:

```tsx
const [localDesc, setLocalDesc] = useState(item.description)
useEffect(() => { setLocalDesc(item.description) }, [item.id, item.description])
```

After the title+status row div, add:

```tsx
<textarea
  value={localDesc}
  onChange={e => setLocalDesc(e.target.value)}
  onBlur={e => {
    const trimmed = e.target.value.trim()
    if (trimmed !== item.description) {
      dispatch({ type: 'UPDATE_ITEM', id: item.id, description: trimmed })
    }
  }}
  placeholder="Add a description…"
  rows={2}
  className="w-full mt-2 text-xs text-zinc-400 placeholder-zinc-600 bg-transparent outline-none resize-none border-b border-transparent focus:border-zinc-600 transition-colors"
/>
```

- [ ] **Step 2: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/components/items/ItemHeader.tsx
git commit -m "feat: add item description textarea in header"
```

---

### Task 5: Delete UI for Items

**Files:**
- Modify: `src/components/items/ItemCard.tsx` — hover-reveal ✕ button

Use `group` on the outer button, reveal a delete ✕ on group-hover. The ✕ must stop propagation so it doesn't also select the item.

- [ ] **Step 1: Add delete button to ItemCard**

Replace `src/components/items/ItemCard.tsx` with:

```tsx
import { useApp } from '../../context/AppContext'
import type { Item } from '../../types'
import Badge from '../ui/Badge'
import { formatDate, isOverdue } from '../../utils/date'

interface Props { item: Item }

export default function ItemCard({ item }: Props) {
  const { state, dispatch } = useApp()
  const isSelected = state.selectedItemId === item.id
  const status = state.statuses.find(s => s.id === item.statusId)
  const subTasks = state.subTasks.filter(st => st.itemId === item.id)
  const doneSubs = subTasks.filter(st => st.done).length
  const isDone = status?.id === 'done'
  const overdue = isOverdue(item.deadline)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirm(`Delete "${item.title}"?`)) {
      dispatch({ type: 'DELETE_ITEM', id: item.id })
    }
  }

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_ITEM', id: item.id })}
      className={`group w-full text-left px-3 py-2 rounded-r border-l-2 transition-colors mb-1 ${
        isSelected
          ? 'border-teal-500 bg-zinc-700 text-white'
          : 'border-transparent hover:bg-zinc-800 text-zinc-400'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-medium flex-1 ${isDone ? 'line-through text-zinc-600' : isSelected ? 'text-white' : 'text-zinc-300'}`}>
          {item.title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {status && <Badge label={status.label} color={status.color} />}
          <span
            role="button"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[11px] transition-opacity leading-none"
            title="Delete item"
          >
            ✕
          </span>
        </div>
      </div>
      <div className="flex gap-2 mt-1 text-[10px] text-zinc-600">
        {item.deadline && (
          <span className={overdue ? 'text-red-400' : ''}>
            ⏰ {formatDate(item.deadline)}{overdue && ' · overdue'}
          </span>
        )}
        {subTasks.length > 0 && <span>{doneSubs}/{subTasks.length} tasks</span>}
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/components/items/ItemCard.tsx
git commit -m "feat: hover-reveal delete button on item cards"
```

---

### Task 6: Delete UI for Projects and BUs

**Files:**
- Modify: `src/components/projects/ProjectListItem.tsx` — hover-reveal ✕
- Modify: `src/components/bu/BuSelector.tsx` — ✕ beside each BU chip

- [ ] **Step 1: Update ProjectListItem**

Replace `src/components/projects/ProjectListItem.tsx` with:

```tsx
import { useApp } from '../../context/AppContext'
import type { Project } from '../../types'

interface Props { project: Project }

export default function ProjectListItem({ project }: Props) {
  const { state, dispatch } = useApp()
  const isSelected = state.selectedProjectId === project.id

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    const itemCount = state.items.filter(i => i.projectId === project.id).length
    const msg = itemCount > 0
      ? `Delete "${project.name}" and its ${itemCount} item(s)?`
      : `Delete "${project.name}"?`
    if (confirm(msg)) {
      dispatch({ type: 'DELETE_PROJECT', id: project.id })
    }
  }

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_PROJECT', id: project.id })}
      className={`group w-full text-left px-3 py-2 rounded-r transition-colors border-l-2 ${
        isSelected
          ? 'border-teal-500 bg-zinc-700 text-white'
          : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-medium truncate flex-1">{project.name}</p>
        <span
          role="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[11px] transition-opacity shrink-0"
          title="Delete project"
        >
          ✕
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 mt-0.5">
        {state.items.filter(i => i.projectId === project.id).length} items
      </p>
    </button>
  )
}
```

- [ ] **Step 2: Update BuSelector**

In `src/components/bu/BuSelector.tsx`, replace the BU chip button with a wrapper that adds a ✕ button:

```tsx
{businessUnits.map(bu => (
  <div key={bu.id} className="group relative inline-flex items-center">
    <button
      onClick={() => dispatch({ type: 'SELECT_BU', id: bu.id })}
      className={`px-2 py-0.5 rounded text-xs transition-colors pr-5 ${
        selectedBuId === bu.id
          ? 'bg-teal-500 text-white'
          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
      }`}
    >
      {bu.name}
    </button>
    <button
      onClick={() => {
        const projectCount = state.projects.filter(p => p.businessUnitIds.includes(bu.id)).length
        const msg = projectCount > 0
          ? `Delete "${bu.name}" and its ${projectCount} project(s)?`
          : `Delete "${bu.name}"?`
        if (confirm(msg)) dispatch({ type: 'DELETE_BU', id: bu.id })
      }}
      className="absolute right-0.5 opacity-0 group-hover:opacity-100 text-[9px] text-zinc-400 hover:text-red-400 transition-opacity w-4 h-4 flex items-center justify-center"
      title="Delete unit"
    >
      ✕
    </button>
  </div>
))}
```

Note: BuSelector needs `const { state, dispatch } = useApp()` — it already has this.

- [ ] **Step 3: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add src/components/projects/ProjectListItem.tsx src/components/bu/BuSelector.tsx
git commit -m "feat: hover-reveal delete buttons on projects and BU chips"
```

---

### Task 7: Search in MiddlePanel

**Files:**
- Modify: `src/components/items/ItemList.tsx` — add search input above the item list

- [ ] **Step 1: Add search state and filter**

In `src/components/items/ItemList.tsx`, add search state alongside existing state:

```tsx
const [search, setSearch] = useState('')
```

After the `useEffect` that resets `filterStatus`, add:

```tsx
useEffect(() => { setSearch('') }, [selectedProjectId])
```

Update `projectItems` to also filter by search:

```tsx
const projectItems = items
  .filter(i => i.projectId === selectedProjectId)
  .filter(i => filterStatus === 'all' || i.statusId === filterStatus)
  .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => {
    const aIsDone = a.statusId === 'done' ? 1 : 0
    const bIsDone = b.statusId === 'done' ? 1 : 0
    return aIsDone - bIsDone || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
```

In the rendered JSX, add a search input between the project name header and the `StatusFilterTabs`:

```tsx
<div className="px-3 pt-3 pb-1 border-b border-zinc-700">
  <p className="text-xs font-semibold text-zinc-200 truncate">{project.name}</p>
  <input
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Search items…"
    className="mt-2 w-full text-[11px] bg-transparent text-zinc-300 placeholder-zinc-600 outline-none border-b border-transparent focus:border-zinc-600 transition-colors pb-1"
  />
</div>
```

- [ ] **Step 2: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/components/items/ItemList.tsx
git commit -m "feat: add search filter in item list"
```

---

### Task 8: Deeper import validation

**Files:**
- Modify: `src/components/layout/TopBar.tsx` — validate array item shapes

Validate that each array element has the minimum required shape. A valid backup must have objects with at least an `id` field.

- [ ] **Step 1: Add shape validation helper inline in TopBar**

In `src/components/layout/TopBar.tsx`, update the import handler:

```tsx
function isArrayOfObjects(arr: unknown): arr is Record<string, unknown>[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null && 'id' in item)
}

// Inside handleImport, replace the validation check:
if (
  !isArrayOfObjects(data.businessUnits) ||
  !isArrayOfObjects(data.statuses) ||
  !isArrayOfObjects(data.projects) ||
  !isArrayOfObjects(data.items)
) throw new Error('Invalid file')
```

- [ ] **Step 2: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/TopBar.tsx
git commit -m "fix: validate array item shapes on import"
```

---

### Task 9: Status drag-to-reorder in Settings

**Files:**
- Modify: `src/components/settings/SettingsPage.tsx` — drag-and-drop reorder for statuses

Use HTML5 drag-and-drop API (no library needed). On dragend, dispatch `REORDER_STATUSES`.

- [ ] **Step 1: Add drag state and handlers**

Replace the status list section in `src/components/settings/SettingsPage.tsx`. Add drag state:

```tsx
const [dragId, setDragId] = useState<string | null>(null)
const [orderedIds, setOrderedIds] = useState<string[]>(() => statuses.map(s => s.id))

// Keep orderedIds in sync when statuses change from outside
useEffect(() => {
  setOrderedIds(statuses.map(s => s.id))
}, [statuses.map(s => s.id).join(',')])

function handleDragStart(id: string) { setDragId(id) }

function handleDragOver(e: React.DragEvent, overId: string) {
  e.preventDefault()
  if (!dragId || dragId === overId) return
  setOrderedIds(prev => {
    const ids = [...prev]
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(overId)
    if (from === -1 || to === -1) return prev
    ids.splice(from, 1)
    ids.splice(to, 0, dragId)
    return ids
  })
}

function handleDragEnd() {
  if (dragId) dispatch({ type: 'REORDER_STATUSES', ids: orderedIds })
  setDragId(null)
}
```

For the displayed status list, use `orderedIds` to determine order:

```tsx
const displayedStatuses = orderedIds
  .map(id => statuses.find(s => s.id === id))
  .filter((s): s is typeof statuses[0] => s !== undefined)
```

Update the status list items to be draggable:

```tsx
{displayedStatuses.map(status => (
  <div
    key={status.id}
    draggable
    onDragStart={() => handleDragStart(status.id)}
    onDragOver={e => handleDragOver(e, status.id)}
    onDragEnd={handleDragEnd}
    className={`flex items-center gap-3 px-4 py-3 cursor-grab ${dragId === status.id ? 'opacity-50' : ''}`}
  >
    <span className="text-zinc-700 text-xs select-none">⠿</span>
    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: status.color }} />
    <span className="text-sm text-zinc-200 flex-1">{status.label}</span>
    <span className="text-[10px] text-zinc-600">{status.scope}</span>
    {!status.isDefault && (
      <button
        onClick={() => {
          const inUse = state.items.some(i => i.statusId === status.id)
          if (inUse) {
            dispatch({ type: 'SET_TOAST', toast: { message: 'Cannot delete — status is in use', type: 'error' } })
            return
          }
          dispatch({ type: 'DELETE_STATUS', id: status.id })
        }}
        className="text-zinc-600 hover:text-red-400 text-[11px]"
      >
        Delete
      </button>
    )}
    {status.isDefault && <span className="text-[10px] text-zinc-700">🔒</span>}
  </div>
))}
```

- [ ] **Step 2: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/SettingsPage.tsx
git commit -m "feat: drag-to-reorder statuses in settings"
```

---

## Frontend Redesign Tasks

---

### Task 10: Design tokens — CSS variables + Tailwind theme

**Files:**
- Modify: `src/index.css` — add CSS custom properties for Direction A color system
- Modify: `tailwind.config.ts` — extend theme with design tokens

- [ ] **Step 1: Add CSS custom properties to index.css**

Add after the `@tailwind` directives in `src/index.css`:

```css
@layer base {
  :root {
    --pm-bg:            oklch(14% 0.006 240);
    --pm-surface:       oklch(16% 0.007 240);
    --pm-surface-up:    oklch(18% 0.008 240);
    --pm-border-subtle: oklch(20% 0.008 240);
    --pm-border:        oklch(25% 0.009 240);
    --pm-text:          oklch(94% 0.005 240);
    --pm-text-2:        oklch(72% 0.008 240);
    --pm-text-muted:    oklch(45% 0.007 240);
    --pm-text-dim:      oklch(32% 0.006 240);
    --pm-accent:        oklch(72% 0.14 195);
    --pm-accent-sub:    oklch(22% 0.05 195);
    --pm-danger:        oklch(68% 0.18 25);
    --pm-danger-sub:    oklch(20% 0.05 25);
  }
}
```

Update the body style:

```css
body {
  background: var(--pm-bg);
  color: var(--pm-text);
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

Update Tiptap styles to use tokens:

```css
.tiptap { @apply outline-none text-sm leading-relaxed; color: var(--pm-text-2); }
.tiptap ul { @apply list-disc pl-4 my-1; }
.tiptap strong { color: var(--pm-text); font-weight: 600; }
.tiptap em { color: var(--pm-text-muted); }
.tiptap a { color: var(--pm-accent); text-decoration: underline; }
```

- [ ] **Step 2: Extend tailwind.config.ts with design tokens**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pm: {
          bg:         'var(--pm-bg)',
          surface:    'var(--pm-surface)',
          'surface-up': 'var(--pm-surface-up)',
          'border-subtle': 'var(--pm-border-subtle)',
          border:     'var(--pm-border)',
          text:       'var(--pm-text)',
          'text-2':   'var(--pm-text-2)',
          muted:      'var(--pm-text-muted)',
          dim:        'var(--pm-text-dim)',
          accent:     'var(--pm-accent)',
          'accent-sub': 'var(--pm-accent-sub)',
          danger:     'var(--pm-danger)',
          'danger-sub': 'var(--pm-danger-sub)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 3: Run dev build to verify compilation**

```
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/index.css tailwind.config.ts
git commit -m "feat: add Direction A CSS token system and Tailwind theme extension"
```

---

### Task 11: Redesign TopBar

**Files:**
- Modify: `src/components/layout/TopBar.tsx`

Direction A TopBar: `bg-pm-surface`, `border-pm-border-subtle`, logo `font-semibold text-pm-accent tracking-tight`, buttons `text-pm-muted hover:text-pm-text-2`.

- [ ] **Step 1: Update TopBar classes**

Replace the JSX in `src/components/layout/TopBar.tsx`:

```tsx
return (
  <header className="flex items-center justify-between px-4 h-10 bg-pm-surface border-b border-pm-border-subtle shrink-0">
    <span className="text-sm font-semibold text-pm-accent tracking-tight" style={{ letterSpacing: '-0.02em' }}>
      PM Tracker
    </span>
    <div className="flex items-center gap-4">
      <button onClick={handleExport} className="text-[11px] text-pm-muted hover:text-pm-text-2 transition-colors">
        Export
      </button>
      <button onClick={handleImport} className="text-[11px] text-pm-muted hover:text-pm-text-2 transition-colors">
        Import
      </button>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        className="text-[11px] text-pm-muted hover:text-pm-text-2 transition-colors"
        title="Settings"
      >
        Settings
      </button>
    </div>
  </header>
)
```

- [ ] **Step 2: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/TopBar.tsx
git commit -m "redesign: apply Direction A to TopBar"
```

---

### Task 12: Redesign LeftPanel, BuSelector, ProjectList, ProjectListItem

**Files:**
- Modify: `src/components/layout/LeftPanel.tsx`
- Modify: `src/components/bu/BuSelector.tsx`
- Modify: `src/components/projects/ProjectList.tsx`
- Modify: `src/components/projects/ProjectListItem.tsx`

Direction A left panel: `bg-pm-surface border-pm-border-subtle`. Section labels: `text-[9px] uppercase tracking-[0.1em] text-pm-muted`. BU chips: accent for active, surface-up for inactive. Project rows: left-border selection, surface-up on hover.

- [ ] **Step 1: Update LeftPanel**

```tsx
export default function LeftPanel() {
  const { state } = useApp()
  return (
    <div className="w-48 bg-pm-surface border-r border-pm-border-subtle shrink-0 flex flex-col overflow-hidden">
      <BuSelector />
      <ProjectList />
      {state.selectedProjectId && <ProjectDocsLinks />}
    </div>
  )
}
```

- [ ] **Step 2: Update BuSelector**

Replace all Tailwind classes in `src/components/bu/BuSelector.tsx`:

Section label: `text-[9px] uppercase tracking-[0.1em] text-pm-muted mb-2`

BU chip (active): `bg-pm-accent text-pm-bg text-[10px] font-medium px-2 py-0.5 rounded`

BU chip (inactive): `bg-pm-surface-up text-pm-text-2 hover:text-pm-text text-[10px] font-medium px-2 py-0.5 rounded transition-colors`

Input: `flex-1 text-[11px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent`

Add/Cancel buttons: `text-[10px] text-pm-accent hover:text-pm-text`, `text-[10px] text-pm-muted hover:text-pm-text-2`

"+ New Unit": `text-[10px] text-pm-accent hover:text-pm-text-2 transition-colors`

- [ ] **Step 3: Update ProjectList**

Section label: `text-[9px] uppercase tracking-[0.1em] text-pm-muted px-3 pt-3 pb-1`

Empty text: `text-[11px] text-pm-muted px-3 py-2`

Border on add form container: `border-t border-pm-border-subtle`

Input: `flex-1 text-[11px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent`

Add/Cancel: same as BuSelector

"+ New Project": `text-[10px] text-pm-accent hover:text-pm-text-2 transition-colors`

- [ ] **Step 4: Update ProjectListItem**

```tsx
<button
  onClick={() => dispatch({ type: 'SELECT_PROJECT', id: project.id })}
  className={`group w-full text-left px-3 py-1.5 transition-colors border-l-2 ${
    isSelected
      ? 'border-pm-accent bg-pm-surface-up text-pm-text'
      : 'border-transparent text-pm-text-2 hover:text-pm-text hover:bg-pm-surface-up'
  }`}
>
  <div className="flex items-center justify-between gap-1">
    <p className="text-[11px] font-medium truncate flex-1" style={{ letterSpacing: '-0.01em' }}>{project.name}</p>
    <span
      role="button"
      onClick={handleDelete}
      className="opacity-0 group-hover:opacity-100 text-pm-muted hover:text-pm-danger text-[10px] transition-opacity shrink-0"
      title="Delete project"
    >
      ✕
    </span>
  </div>
  <p className="text-[9px] text-pm-muted mt-0.5">
    {state.items.filter(i => i.projectId === project.id).length} items
  </p>
</button>
```

- [ ] **Step 5: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/LeftPanel.tsx src/components/bu/BuSelector.tsx src/components/projects/ProjectList.tsx src/components/projects/ProjectListItem.tsx
git commit -m "redesign: apply Direction A to LeftPanel hierarchy"
```

---

### Task 13: Redesign MiddlePanel, ItemList, ItemCard, StatusFilterTabs, Badge

**Files:**
- Modify: `src/components/layout/MiddlePanel.tsx`
- Modify: `src/components/items/ItemList.tsx`
- Modify: `src/components/items/ItemCard.tsx`
- Modify: `src/components/items/StatusFilterTabs.tsx`
- Modify: `src/components/ui/Badge.tsx`

Direction A middle panel: `bg-pm-bg border-pm-border-subtle`. Item cards: left-border selection, `pm-surface-up` hover. Status filter chips: pill shape, accent active. Badge: pill, hex-alpha background.

- [ ] **Step 1: Update MiddlePanel**

```tsx
export default function MiddlePanel() {
  return (
    <div className="w-56 bg-pm-bg border-r border-pm-border-subtle shrink-0 flex flex-col overflow-hidden">
      <ItemList />
    </div>
  )
}
```

- [ ] **Step 2: Update StatusFilterTabs**

Read the current file first, then update to use pm- classes. The pill chips should use:

Active chip: `bg-pm-accent text-pm-bg text-[9px] font-semibold px-2 py-0.5 rounded-full`
Inactive chip: `border border-pm-border text-pm-muted text-[9px] px-2 py-0.5 rounded-full hover:text-pm-text-2 transition-colors`

- [ ] **Step 3: Update ItemList**

Project name: `text-[11px] font-semibold text-pm-text truncate`

Search input: `mt-1.5 w-full text-[10px] bg-transparent text-pm-text-2 placeholder-pm-muted outline-none border-b border-transparent focus:border-pm-border transition-colors pb-0.5`

Add form container: `border-t border-pm-border-subtle`

Input: `flex-1 text-[10px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent`

Buttons: accent / muted

"+ New Item": `text-[10px] text-pm-accent hover:text-pm-text-2 transition-colors`

- [ ] **Step 4: Update ItemCard**

```tsx
<button
  onClick={() => dispatch({ type: 'SELECT_ITEM', id: item.id })}
  className={`group w-full text-left px-3 py-1.5 border-l-2 transition-colors mb-px ${
    isSelected
      ? 'border-pm-accent bg-pm-surface-up text-pm-text'
      : 'border-transparent hover:bg-pm-surface text-pm-text-2'
  }`}
>
  <div className="flex items-start justify-between gap-2">
    <span className={`text-[11px] font-medium flex-1 ${isDone ? 'line-through text-pm-dim' : isSelected ? 'text-pm-text' : 'text-pm-text-2'}`}
      style={{ letterSpacing: '-0.01em' }}>
      {item.title}
    </span>
    <div className="flex items-center gap-1 shrink-0">
      {status && <Badge label={status.label} color={status.color} />}
      <span
        role="button"
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 text-pm-muted hover:text-pm-danger text-[10px] transition-opacity leading-none"
        title="Delete item"
      >
        ✕
      </span>
    </div>
  </div>
  <div className="flex gap-2 mt-1 text-[9px] text-pm-muted">
    {item.deadline && (
      <span className={overdue ? 'text-pm-danger' : ''}>
        {formatDate(item.deadline)}{overdue && ' · overdue'}
      </span>
    )}
    {subTasks.length > 0 && <span>{doneSubs}/{subTasks.length}</span>}
  </div>
</button>
```

- [ ] **Step 5: Update Badge**

```tsx
export default function Badge({ label, color }: Props) {
  return (
    <span
      className="text-[8px] px-1.5 py-px rounded-full font-semibold whitespace-nowrap"
      style={{ background: `${color}26`, color }}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 6: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/MiddlePanel.tsx src/components/items/ItemList.tsx src/components/items/ItemCard.tsx src/components/items/StatusFilterTabs.tsx src/components/ui/Badge.tsx
git commit -m "redesign: apply Direction A to MiddlePanel hierarchy"
```

---

### Task 14: Redesign RightPanel, ItemHeader, TabBar

**Files:**
- Modify: `src/components/layout/RightPanel.tsx`
- Modify: `src/components/items/ItemHeader.tsx`
- Modify: `src/components/detail/TabBar.tsx`

Direction A right panel: `bg-pm-bg`. Header: transparent with border. Title input: borderless at rest, `border-b border-pm-accent` on focus. Status select: same pill style. Tabs: subtle tracking label style, accent underline on active.

- [ ] **Step 1: Update RightPanel**

```tsx
if (!selectedItemId) {
  return (
    <div className="flex-1 bg-pm-bg flex items-center justify-center">
      <EmptyState icon="→" title="Select an item" subtitle="Pick one from the middle panel" />
    </div>
  )
}

return (
  <div className="flex-1 bg-pm-bg flex flex-col overflow-hidden">
    <ItemHeader />
    <TabBar />
    <div className="flex-1 overflow-y-auto">
      {activeTab === 'subtasks'     && <SubTasksTab />}
      {activeTab === 'conversation' && <ConversationTab />}
      {activeTab === 'links'        && <LinksTab />}
      {activeTab === 'activity'     && <ActivityTab />}
    </div>
  </div>
)
```

- [ ] **Step 2: Update ItemHeader**

```tsx
return (
  <div className="px-4 py-3 border-b border-pm-border-subtle shrink-0">
    <div className="flex items-start justify-between gap-3 mb-2">
      <input
        value={localTitle}
        onChange={e => setLocalTitle(e.target.value)}
        onBlur={e => {
          const trimmed = e.target.value.trim()
          if (trimmed && trimmed !== item.title) dispatch({ type: 'UPDATE_ITEM', id: item.id, title: trimmed })
          else setLocalTitle(item.title)
        }}
        className="flex-1 text-[13px] font-semibold text-pm-text bg-transparent outline-none border-b border-transparent focus:border-pm-accent transition-colors"
        style={{ letterSpacing: '-0.01em' }}
      />
      <select
        value={item.statusId}
        onChange={e => dispatch({ type: 'CHANGE_ITEM_STATUS', id: item.id, statusId: e.target.value })}
        className="text-[9px] rounded-full px-2 py-0.5 border outline-none cursor-pointer font-semibold"
        style={{ background: `${status?.color ?? '#71717a'}26`, color: status?.color ?? '#71717a', borderColor: `${status?.color ?? '#71717a'}55` }}
      >
        {projectStatuses.map(s => (
          <option key={s.id} value={s.id} style={{ background: 'var(--pm-surface)', color: 'var(--pm-text)' }}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
    <textarea
      value={localDesc}
      onChange={e => setLocalDesc(e.target.value)}
      onBlur={e => {
        const trimmed = e.target.value.trim()
        if (trimmed !== item.description) dispatch({ type: 'UPDATE_ITEM', id: item.id, description: trimmed })
      }}
      placeholder="Add a description…"
      rows={2}
      className="w-full mt-1 text-[11px] text-pm-text-2 placeholder-pm-muted bg-transparent outline-none resize-none border-b border-transparent focus:border-pm-border transition-colors pb-0.5"
    />
    <div className="flex items-center gap-4 text-[10px] text-pm-muted mt-2">
      <label className={`flex items-center gap-1 cursor-pointer ${item.deadline && isOverdue(item.deadline) ? 'text-pm-danger' : ''}`}>
        <span>Deadline</span>
        <input
          type="date"
          value={item.deadline ? item.deadline.slice(0, 10) : ''}
          onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: e.target.value || null })}
          className="bg-transparent outline-none cursor-pointer hover:text-pm-text-2 transition-colors"
        />
      </label>
      {item.deadline && (
        <button
          onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: null })}
          className="text-pm-muted hover:text-pm-danger transition-colors"
        >
          clear
        </button>
      )}
    </div>
  </div>
)
```

- [ ] **Step 3: Read and update TabBar**

Read `src/components/detail/TabBar.tsx` then update its classes:

Active tab: `text-pm-accent text-[10px] uppercase tracking-[0.1em] font-medium border-b border-pm-accent pb-2 px-3 transition-colors`

Inactive tab: `text-pm-muted text-[10px] uppercase tracking-[0.1em] font-medium border-b border-transparent pb-2 px-3 hover:text-pm-text-2 transition-colors`

Container: `flex border-b border-pm-border-subtle px-1 pt-1 shrink-0 bg-pm-surface`

- [ ] **Step 4: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/RightPanel.tsx src/components/items/ItemHeader.tsx src/components/detail/TabBar.tsx
git commit -m "redesign: apply Direction A to RightPanel, ItemHeader, TabBar"
```

---

### Task 15: Redesign detail tabs (SubTasks, Conversation, Links, Activity) + Toast

**Files:**
- Modify: `src/components/detail/SubTasksTab.tsx`
- Modify: `src/components/detail/ConversationTab.tsx`
- Modify: `src/components/detail/ConversationBubble.tsx`
- Modify: `src/components/detail/LinksTab.tsx`
- Modify: `src/components/detail/ActivityTab.tsx`
- Modify: `src/components/ui/Toast.tsx`
- Modify: `src/components/ui/EmptyState.tsx`

Direction A detail tabs: content padding 16px. Subtask checkboxes: `accent-[var(--pm-accent)]`. Conversation bubble: `bg-pm-surface rounded-lg`. Activity dots and connector: same DOT_COLORS. Toast: `bg-pm-surface border border-pm-border`.

- [ ] **Step 1: Read all target files first**

Read each file to understand current structure before editing:
- `src/components/detail/SubTasksTab.tsx`
- `src/components/detail/ConversationTab.tsx`
- `src/components/detail/ConversationBubble.tsx`
- `src/components/detail/ConversationCompose.tsx`
- `src/components/detail/LinksTab.tsx`
- `src/components/detail/ActivityTab.tsx`
- `src/components/ui/Toast.tsx`
- `src/components/ui/EmptyState.tsx`

- [ ] **Step 2: Update each file**

For each file, apply Direction A tokens:
- `zinc-900` → `pm-bg`, `zinc-800` → `pm-surface`, `zinc-700` → `pm-surface-up`/`pm-border`
- `zinc-600`/`zinc-500` borders → `pm-border`/`pm-border-subtle`
- `zinc-200`/`zinc-300` text → `pm-text`/`pm-text-2`
- `zinc-400`/`zinc-500`/`zinc-600` text → `pm-text-2`/`pm-muted`/`pm-dim`
- `teal-500`/`teal-400` → `pm-accent`
- `red-400` → `pm-danger`
- Remove `rounded-lg` from cards inside tabs — Direction A uses no inner card rounding, just section separators

Toast: 
```tsx
// Success: bg-pm-accent-sub border border-pm-accent, text-pm-accent
// Error: bg-pm-danger-sub border border-pm-danger, text-pm-danger
```

EmptyState: icon text `text-pm-muted`, title `text-pm-text-2 text-xs font-medium`, subtitle `text-pm-muted text-[10px]`

- [ ] **Step 3: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add src/components/detail/ src/components/ui/Toast.tsx src/components/ui/EmptyState.tsx
git commit -m "redesign: apply Direction A to detail tabs and UI primitives"
```

---

### Task 16: Redesign SettingsPage + App Welcome screen

**Files:**
- Modify: `src/components/settings/SettingsPage.tsx`
- Modify: `src/App.tsx` — Welcome component

Direction A settings: surface background, muted section labels. Welcome: centered on `pm-bg`, teal CTA button.

- [ ] **Step 1: Update SettingsPage**

Apply pm- tokens throughout:
- Container: `bg-pm-bg` overall
- Cards: `bg-pm-surface border border-pm-border rounded-lg` (outer card is fine, it's not a nested card pattern)
- Section label: `text-[9px] font-medium text-pm-muted uppercase tracking-[0.1em] mb-3`
- Status row items: `text-pm-text-2`
- Delete button: `text-pm-muted hover:text-pm-danger`
- Status add form input: same as other inputs
- Add status button: `bg-pm-accent text-pm-bg font-semibold text-[11px] px-3 py-1.5 rounded transition-colors hover:opacity-90`
- Back button: `text-[11px] text-pm-muted hover:text-pm-text-2 transition-colors`
- Heading: `text-pm-text text-[13px] font-semibold`

- [ ] **Step 2: Update App.tsx Welcome component**

```tsx
function Welcome() {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'ADD_BU', name: name.trim(), description: '' })
  }
  return (
    <div className="flex-1 flex items-center justify-center bg-pm-bg">
      <div className="text-center max-w-sm px-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-pm-muted mb-6">PM Tracker</p>
        <h1 className="text-xl font-semibold text-pm-text mb-2" style={{ letterSpacing: '-0.02em' }}>
          Your personal PM diary
        </h1>
        <p className="text-[12px] text-pm-muted mb-8">
          Start by creating a Business Unit.
        </p>
        <form onSubmit={submit} className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Engineering, Marketing…"
            className="flex-1 text-[12px] bg-pm-surface text-pm-text border border-pm-border rounded-lg px-3 py-2 outline-none focus:border-pm-accent transition-colors placeholder-pm-muted"
          />
          <button type="submit" className="bg-pm-accent text-pm-bg text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run tests**

```
npm test
```

Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/SettingsPage.tsx src/App.tsx
git commit -m "redesign: apply Direction A to Settings and Welcome screen"
```

---

### Task 17: Final type check, lint, and deploy

**Files:** Various, read-only verification

- [ ] **Step 1: Full type check**

```
npx tsc --noEmit
```

Expected: 0 errors. Fix any type errors before proceeding.

- [ ] **Step 2: Lint**

```
npm run lint
```

Expected: 0 errors (warnings ok)

- [ ] **Step 3: Full test suite**

```
npm test
```

Expected: all tests pass

- [ ] **Step 4: Push to trigger deploy**

```bash
git push origin master
```

Expected: GitHub Actions workflow triggers, deploys to https://nikhil-thomas-a.github.io/pm-tracker/

- [ ] **Step 5: Confirm deploy**

```bash
gh run list --limit 3
```

Expected: most recent run shows completed/in_progress status
