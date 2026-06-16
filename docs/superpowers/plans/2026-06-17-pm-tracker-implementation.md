# PM Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first, single-user PM tracking web app (React + Vite + localStorage) with a four-level hierarchy (Business Unit → Project → Item → Sub-task), rich-text conversations, activity logs, and JSON backup.

**Architecture:** Single-page React app with no router — selection state (active BU / Project / Item) lives in a top-level `useReducer`. All data is persisted to a single localStorage key (`pmtracker_v1`) as JSON. Components are pure/presentational; all mutations go through the reducer.

**Tech Stack:** React 18 + Vite 5 · TypeScript · Tailwind CSS v3 (zinc + teal palette) · Tiptap 2 (rich text) · date-fns 3 · Vitest

---

## File Map

```
src/
  types/index.ts              — all TS interfaces
  data/
    defaults.ts               — DEFAULT_STATUSES seed data
    storage.ts                — loadData() / saveData()
  utils/
    id.ts                     — generateId()
    date.ts                   — formatDate() / formatDateTime()
    activity.ts               — createActivityEntry() factory
  context/
    reducer.ts                — pure AppState reducer + Action union
    AppContext.tsx             — Context + Provider + useApp hook
  components/
    layout/
      TopBar.tsx
      ThreePanel.tsx
      LeftPanel.tsx
      MiddlePanel.tsx
      RightPanel.tsx
    bu/
      BuSelector.tsx
    projects/
      ProjectList.tsx
      ProjectListItem.tsx
      ProjectDocsLinks.tsx
    items/
      StatusFilterTabs.tsx
      ItemList.tsx
      ItemCard.tsx
      ItemHeader.tsx
    detail/
      TabBar.tsx
      SubTasksTab.tsx
      ConversationTab.tsx
      ConversationBubble.tsx
      ConversationCompose.tsx
      LinksTab.tsx
      ActivityTab.tsx
    settings/
      SettingsPage.tsx
    ui/
      Badge.tsx
      EmptyState.tsx
      Toast.tsx
  App.tsx
  main.tsx
  index.css
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `.gitignore` additions

- [ ] **Step 1: Write package.json**

```json
{
  "name": "pm-tracker",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tiptap/react": "^2.6.6",
    "@tiptap/starter-kit": "^2.6.6",
    "@tiptap/extension-underline": "^2.6.6",
    "@tiptap/extension-link": "^2.6.6",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "vitest": "^2.0.5",
    "tailwindcss": "^3.4.10",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41"
  }
}
```

- [ ] **Step 2: Write vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Write tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Write tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts", "postcss.config.ts"]
}
```

- [ ] **Step 6: Write tailwind.config.ts**

Tailwind's built-in `zinc` and `teal` palette already matches the spec exactly (`zinc-900=#18181b`, `zinc-800=#27272a`, `zinc-700=#3f3f46`, `teal-500=#14b8a6`). No custom colors needed.

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

- [ ] **Step 7: Write postcss.config.ts**

```ts
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 8: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PM Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Write src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  @apply bg-zinc-900 text-zinc-100;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Tiptap editor styles */
.tiptap {
  @apply outline-none text-sm text-zinc-200 leading-relaxed;
}
.tiptap ul {
  @apply list-disc pl-4 my-1;
}
.tiptap strong {
  @apply text-white font-semibold;
}
.tiptap em {
  @apply text-zinc-400;
}
.tiptap a {
  @apply text-teal-400 underline;
}
```

- [ ] **Step 10: Write src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 11: Write src/App.tsx (placeholder)**

```tsx
export default function App() {
  return (
    <div className="flex items-center justify-center h-screen text-zinc-500">
      PM Tracker — scaffold OK
    </div>
  )
}
```

- [ ] **Step 12: Install dependencies**

```bash
npm install
```

Expected: packages installed, no errors.

- [ ] **Step 13: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: page shows "PM Tracker — scaffold OK" on a dark background.

- [ ] **Step 14: Add `.superpowers/` to .gitignore**

Append to `.gitignore` (create it if missing):

```
node_modules/
dist/
.superpowers/
```

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: scaffold React + Vite + Tailwind project"
```

---

## Task 2: TypeScript Types + Default Statuses

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/defaults.ts`
- Create: `src/__tests__/defaults.test.ts`

- [ ] **Step 1: Write src/types/index.ts**

```ts
export interface BusinessUnit {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface DocLink {
  id: string
  label: string
  url: string
}

export interface Project {
  id: string
  name: string
  description: string
  businessUnitIds: string[]
  docs: DocLink[]
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  projectId: string
  title: string
  description: string
  statusId: string
  deadline: string | null
  links: DocLink[]
  createdAt: string
  updatedAt: string
}

export interface SubTask {
  id: string
  itemId: string
  title: string
  done: boolean
  createdAt: string
}

export interface ConversationEntry {
  id: string
  itemId: string
  content: string
  createdAt: string
}

export type ActivityType =
  | 'item_created'
  | 'status_changed'
  | 'subtask_checked'
  | 'subtask_unchecked'
  | 'deadline_set'
  | 'deadline_cleared'
  | 'link_added'
  | 'link_removed'
  | 'note_added'

export interface ActivityEntry {
  id: string
  itemId: string
  type: ActivityType
  description: string
  createdAt: string
}

export interface Status {
  id: string
  label: string
  color: string
  scope: 'global' | 'project'
  projectId?: string
  isDefault: boolean
  order: number
}

export interface AppData {
  businessUnits: BusinessUnit[]
  projects: Project[]
  items: Item[]
  subTasks: SubTask[]
  conversationEntries: ConversationEntry[]
  activityEntries: ActivityEntry[]
  statuses: Status[]
}

export type TabId = 'subtasks' | 'conversation' | 'links' | 'activity'

export interface AppState extends AppData {
  selectedBuId: string | null
  selectedProjectId: string | null
  selectedItemId: string | null
  activeTab: TabId
  showSettings: boolean
  toast: { message: string; type: 'success' | 'error' } | null
}
```

- [ ] **Step 2: Write src/data/defaults.ts**

```ts
import type { Status } from '../types'

export const DEFAULT_STATUSES: Status[] = [
  { id: 'backlog',     label: 'Backlog',      color: '#71717a', scope: 'global', isDefault: true, order: 0 },
  { id: 'in-progress', label: 'In Progress',  color: '#f59e0b', scope: 'global', isDefault: true, order: 1 },
  { id: 'in-review',  label: 'In Review',    color: '#6366f1', scope: 'global', isDefault: true, order: 2 },
  { id: 'done',       label: 'Done',         color: '#14b8a6', scope: 'global', isDefault: true, order: 3 },
]
```

- [ ] **Step 3: Write src/__tests__/defaults.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_STATUSES } from '../data/defaults'

describe('DEFAULT_STATUSES', () => {
  it('has exactly 4 entries', () => {
    expect(DEFAULT_STATUSES).toHaveLength(4)
  })

  it('all entries are global and default', () => {
    DEFAULT_STATUSES.forEach(s => {
      expect(s.scope).toBe('global')
      expect(s.isDefault).toBe(true)
    })
  })

  it('labels are the expected workflow', () => {
    const labels = DEFAULT_STATUSES.map(s => s.label)
    expect(labels).toEqual(['Backlog', 'In Progress', 'In Review', 'Done'])
  })

  it('orders are sequential starting at 0', () => {
    DEFAULT_STATUSES.forEach((s, i) => expect(s.order).toBe(i))
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/data/defaults.ts src/__tests__/defaults.test.ts
git commit -m "feat: add TypeScript types and default statuses"
```

---

## Task 3: Storage Module

**Files:**
- Create: `src/data/storage.ts`
- Create: `src/__tests__/storage.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/__tests__/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { loadData, saveData } from '../data/storage'
import type { AppData } from '../types'
import { DEFAULT_STATUSES } from '../data/defaults'

const EMPTY_DATA: AppData = {
  businessUnits: [],
  projects: [],
  items: [],
  subTasks: [],
  conversationEntries: [],
  activityEntries: [],
  statuses: DEFAULT_STATUSES,
}

beforeEach(() => localStorage.clear())

describe('loadData', () => {
  it('returns default data when localStorage is empty', () => {
    const data = loadData()
    expect(data.businessUnits).toEqual([])
    expect(data.statuses).toHaveLength(4)
  })
})

describe('saveData + loadData', () => {
  it('roundtrips AppData correctly', () => {
    const data: AppData = {
      ...EMPTY_DATA,
      businessUnits: [{ id: '1', name: 'Engineering', description: '', createdAt: '2026-06-17T10:00:00Z' }],
    }
    saveData(data)
    const loaded = loadData()
    expect(loaded.businessUnits).toHaveLength(1)
    expect(loaded.businessUnits[0].name).toBe('Engineering')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../data/storage'`

- [ ] **Step 3: Write src/data/storage.ts**

```ts
import type { AppData } from '../types'
import { DEFAULT_STATUSES } from './defaults'

const STORAGE_KEY = 'pmtracker_v1'

const EMPTY_DATA: AppData = {
  businessUnits: [],
  projects: [],
  items: [],
  subTasks: [],
  conversationEntries: [],
  activityEntries: [],
  statuses: DEFAULT_STATUSES,
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(EMPTY_DATA)
    return JSON.parse(raw) as AppData
  } catch {
    return structuredClone(EMPTY_DATA)
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/storage.ts src/__tests__/storage.test.ts
git commit -m "feat: add localStorage storage module"
```

---

## Task 4: Utility Functions

**Files:**
- Create: `src/utils/id.ts`
- Create: `src/utils/date.ts`
- Create: `src/utils/activity.ts`
- Create: `src/__tests__/activity.test.ts`

- [ ] **Step 1: Write src/utils/id.ts**

```ts
export function generateId(): string {
  return crypto.randomUUID()
}
```

- [ ] **Step 2: Write src/utils/date.ts**

```ts
import { format } from 'date-fns'

export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy')
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'EEE, d MMM yyyy · h:mm a')
}

export function nowISO(): string {
  return new Date().toISOString()
}
```

- [ ] **Step 3: Write failing test for activity**

```ts
// src/__tests__/activity.test.ts
import { describe, it, expect } from 'vitest'
import { createActivityEntry } from '../utils/activity'

describe('createActivityEntry', () => {
  it('creates an entry with the correct type and itemId', () => {
    const entry = createActivityEntry('item-1', 'status_changed', 'Status changed: Backlog → In Progress')
    expect(entry.itemId).toBe('item-1')
    expect(entry.type).toBe('status_changed')
    expect(entry.description).toBe('Status changed: Backlog → In Progress')
    expect(entry.id).toBeDefined()
    expect(entry.createdAt).toBeDefined()
  })

  it('creates unique ids each call', () => {
    const a = createActivityEntry('x', 'note_added', 'Note added')
    const b = createActivityEntry('x', 'note_added', 'Note added')
    expect(a.id).not.toBe(b.id)
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../utils/activity'`

- [ ] **Step 5: Write src/utils/activity.ts**

```ts
import type { ActivityEntry, ActivityType } from '../types'
import { generateId } from './id'
import { nowISO } from './date'

export function createActivityEntry(
  itemId: string,
  type: ActivityType,
  description: string
): ActivityEntry {
  return { id: generateId(), itemId, type, description, createdAt: nowISO() }
}
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/utils/ src/__tests__/activity.test.ts
git commit -m "feat: add id, date, and activity utility functions"
```

---

## Task 5: App Reducer + Context

**Files:**
- Create: `src/context/reducer.ts`
- Create: `src/context/AppContext.tsx`
- Create: `src/__tests__/reducer.test.ts`

- [ ] **Step 1: Write src/context/reducer.ts**

```ts
import type { AppState, AppData, TabId, DocLink } from '../types'
import { DEFAULT_STATUSES } from '../data/defaults'
import { generateId } from '../utils/id'
import { nowISO } from '../utils/date'
import { createActivityEntry } from '../utils/activity'

export const INITIAL_STATE: AppState = {
  businessUnits: [],
  projects: [],
  items: [],
  subTasks: [],
  conversationEntries: [],
  activityEntries: [],
  statuses: DEFAULT_STATUSES,
  selectedBuId: null,
  selectedProjectId: null,
  selectedItemId: null,
  activeTab: 'subtasks',
  showSettings: false,
  toast: null,
}

export type Action =
  | { type: 'ADD_BU'; name: string; description: string }
  | { type: 'UPDATE_BU'; id: string; name?: string; description?: string }
  | { type: 'DELETE_BU'; id: string }
  | { type: 'ADD_PROJECT'; name: string; description: string; businessUnitIds: string[] }
  | { type: 'UPDATE_PROJECT'; id: string; name?: string; description?: string; businessUnitIds?: string[] }
  | { type: 'DELETE_PROJECT'; id: string }
  | { type: 'ADD_PROJECT_DOC'; projectId: string; label: string; url: string }
  | { type: 'DELETE_PROJECT_DOC'; projectId: string; docId: string }
  | { type: 'ADD_ITEM'; projectId: string; title: string }
  | { type: 'UPDATE_ITEM'; id: string; title?: string; description?: string; deadline?: string | null }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'CHANGE_ITEM_STATUS'; id: string; statusId: string }
  | { type: 'ADD_SUBTASK'; itemId: string; title: string }
  | { type: 'TOGGLE_SUBTASK'; id: string }
  | { type: 'DELETE_SUBTASK'; id: string }
  | { type: 'ADD_CONVERSATION_ENTRY'; itemId: string; content: string }
  | { type: 'ADD_ITEM_LINK'; itemId: string; label: string; url: string }
  | { type: 'DELETE_ITEM_LINK'; itemId: string; linkId: string }
  | { type: 'ADD_STATUS'; label: string; color: string; scope: 'global' | 'project'; projectId?: string }
  | { type: 'UPDATE_STATUS'; id: string; label?: string; color?: string }
  | { type: 'DELETE_STATUS'; id: string }
  | { type: 'REORDER_STATUSES'; ids: string[] }
  | { type: 'SELECT_BU'; id: string | null }
  | { type: 'SELECT_PROJECT'; id: string | null }
  | { type: 'SELECT_ITEM'; id: string | null }
  | { type: 'SET_ACTIVE_TAB'; tab: TabId }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_TOAST'; toast: AppState['toast'] }
  | { type: 'IMPORT_DATA'; data: AppData }
  | { type: 'LOAD_DATA'; data: AppData }

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...INITIAL_STATE, ...action.data }

    case 'IMPORT_DATA':
      return { ...INITIAL_STATE, ...action.data, toast: { message: 'Data imported successfully', type: 'success' } }

    // ── Business Units ────────────────────────────────────────────
    case 'ADD_BU': {
      const bu = { id: generateId(), name: action.name, description: action.description, createdAt: nowISO() }
      return { ...state, businessUnits: [...state.businessUnits, bu], selectedBuId: bu.id }
    }
    case 'UPDATE_BU':
      return {
        ...state,
        businessUnits: state.businessUnits.map(bu =>
          bu.id === action.id ? { ...bu, ...(action.name && { name: action.name }), ...(action.description !== undefined && { description: action.description }) } : bu
        ),
      }
    case 'DELETE_BU':
      return {
        ...state,
        businessUnits: state.businessUnits.filter(bu => bu.id !== action.id),
        selectedBuId: state.selectedBuId === action.id ? null : state.selectedBuId,
      }

    // ── Projects ──────────────────────────────────────────────────
    case 'ADD_PROJECT': {
      const now = nowISO()
      const project = { id: generateId(), name: action.name, description: action.description, businessUnitIds: action.businessUnitIds, docs: [], createdAt: now, updatedAt: now }
      return { ...state, projects: [...state.projects, project], selectedProjectId: project.id, selectedItemId: null }
    }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.id
            ? { ...p, ...(action.name && { name: action.name }), ...(action.description !== undefined && { description: action.description }), ...(action.businessUnitIds && { businessUnitIds: action.businessUnitIds }), updatedAt: nowISO() }
            : p
        ),
      }
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        items: state.items.filter(i => i.projectId !== action.id),
        selectedProjectId: state.selectedProjectId === action.id ? null : state.selectedProjectId,
        selectedItemId: null,
      }
    case 'ADD_PROJECT_DOC': {
      const doc: DocLink = { id: generateId(), label: action.label, url: action.url }
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.projectId ? { ...p, docs: [...p.docs, doc], updatedAt: nowISO() } : p
        ),
      }
    }
    case 'DELETE_PROJECT_DOC':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.projectId ? { ...p, docs: p.docs.filter(d => d.id !== action.docId), updatedAt: nowISO() } : p
        ),
      }

    // ── Items ─────────────────────────────────────────────────────
    case 'ADD_ITEM': {
      const now = nowISO()
      const backlogStatus = state.statuses.find(s => s.id === 'backlog') ?? state.statuses[0]
      const item = { id: generateId(), projectId: action.projectId, title: action.title, description: '', statusId: backlogStatus.id, deadline: null, links: [], createdAt: now, updatedAt: now }
      const activity = createActivityEntry(item.id, 'item_created', 'Item created')
      return { ...state, items: [...state.items, item], activityEntries: [...state.activityEntries, activity], selectedItemId: item.id }
    }
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id
            ? { ...i, ...(action.title !== undefined && { title: action.title }), ...(action.description !== undefined && { description: action.description }), ...(action.deadline !== undefined && { deadline: action.deadline }), updatedAt: nowISO() }
            : i
        ),
      }
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
        subTasks: state.subTasks.filter(st => st.itemId !== action.id),
        conversationEntries: state.conversationEntries.filter(c => c.itemId !== action.id),
        activityEntries: state.activityEntries.filter(a => a.itemId !== action.id),
        selectedItemId: state.selectedItemId === action.id ? null : state.selectedItemId,
      }
    case 'CHANGE_ITEM_STATUS': {
      const item = state.items.find(i => i.id === action.id)
      if (!item) return state
      const oldStatus = state.statuses.find(s => s.id === item.statusId)
      const newStatus = state.statuses.find(s => s.id === action.statusId)
      const description = `Status changed: ${oldStatus?.label ?? '?'} → ${newStatus?.label ?? '?'}`
      const activity = createActivityEntry(action.id, 'status_changed', description)
      return {
        ...state,
        items: state.items.map(i => i.id === action.id ? { ...i, statusId: action.statusId, updatedAt: nowISO() } : i),
        activityEntries: [...state.activityEntries, activity],
      }
    }

    // ── Sub-tasks ─────────────────────────────────────────────────
    case 'ADD_SUBTASK': {
      const subTask = { id: generateId(), itemId: action.itemId, title: action.title, done: false, createdAt: nowISO() }
      return { ...state, subTasks: [...state.subTasks, subTask] }
    }
    case 'TOGGLE_SUBTASK': {
      const subTask = state.subTasks.find(st => st.id === action.id)
      if (!subTask) return state
      const nowDone = !subTask.done
      const description = nowDone ? `Sub-task completed: ${subTask.title}` : `Sub-task reopened: ${subTask.title}`
      const activity = createActivityEntry(subTask.itemId, nowDone ? 'subtask_checked' : 'subtask_unchecked', description)
      return {
        ...state,
        subTasks: state.subTasks.map(st => st.id === action.id ? { ...st, done: nowDone } : st),
        activityEntries: [...state.activityEntries, activity],
      }
    }
    case 'DELETE_SUBTASK':
      return { ...state, subTasks: state.subTasks.filter(st => st.id !== action.id) }

    // ── Conversation ──────────────────────────────────────────────
    case 'ADD_CONVERSATION_ENTRY': {
      const entry = { id: generateId(), itemId: action.itemId, content: action.content, createdAt: nowISO() }
      const activity = createActivityEntry(action.itemId, 'note_added', 'Conversation entry added')
      return {
        ...state,
        conversationEntries: [...state.conversationEntries, entry],
        activityEntries: [...state.activityEntries, activity],
      }
    }

    // ── Item Links ────────────────────────────────────────────────
    case 'ADD_ITEM_LINK': {
      const link: DocLink = { id: generateId(), label: action.label, url: action.url }
      const activity = createActivityEntry(action.itemId, 'link_added', `Link added: ${action.label}`)
      return {
        ...state,
        items: state.items.map(i => i.id === action.itemId ? { ...i, links: [...i.links, link] } : i),
        activityEntries: [...state.activityEntries, activity],
      }
    }
    case 'DELETE_ITEM_LINK': {
      const item = state.items.find(i => i.id === action.itemId)
      const link = item?.links.find(l => l.id === action.linkId)
      const activity = link ? createActivityEntry(action.itemId, 'link_removed', `Link removed: ${link.label}`) : null
      return {
        ...state,
        items: state.items.map(i => i.id === action.itemId ? { ...i, links: i.links.filter(l => l.id !== action.linkId) } : i),
        activityEntries: activity ? [...state.activityEntries, activity] : state.activityEntries,
      }
    }

    // ── Statuses ──────────────────────────────────────────────────
    case 'ADD_STATUS': {
      const maxOrder = Math.max(...state.statuses.map(s => s.order), -1)
      const status = { id: generateId(), label: action.label, color: action.color, scope: action.scope, ...(action.projectId && { projectId: action.projectId }), isDefault: false, order: maxOrder + 1 }
      return { ...state, statuses: [...state.statuses, status] }
    }
    case 'UPDATE_STATUS':
      return {
        ...state,
        statuses: state.statuses.map(s =>
          s.id === action.id ? { ...s, ...(action.label && { label: action.label }), ...(action.color && { color: action.color }) } : s
        ),
      }
    case 'DELETE_STATUS':
      return { ...state, statuses: state.statuses.filter(s => s.id !== action.id) }
    case 'REORDER_STATUSES':
      return {
        ...state,
        statuses: action.ids.map((id, order) => {
          const s = state.statuses.find(s => s.id === id)!
          return { ...s, order }
        }),
      }

    // ── UI ────────────────────────────────────────────────────────
    case 'SELECT_BU':
      return { ...state, selectedBuId: action.id, selectedProjectId: null, selectedItemId: null }
    case 'SELECT_PROJECT':
      return { ...state, selectedProjectId: action.id, selectedItemId: null, activeTab: 'subtasks' }
    case 'SELECT_ITEM':
      return { ...state, selectedItemId: action.id, activeTab: 'subtasks' }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings }
    case 'SET_TOAST':
      return { ...state, toast: action.toast }

    default:
      return state
  }
}
```

- [ ] **Step 2: Write src/context/AppContext.tsx**

```tsx
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { reducer, INITIAL_STATE, type Action } from './reducer'
import type { AppState } from '../types'
import { loadData, saveData } from '../data/storage'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadData()
    dispatch({ type: 'LOAD_DATA', data })
  }, [])

  // Persist to localStorage on every state change (skip UI-only fields)
  useEffect(() => {
    const { selectedBuId, selectedProjectId, selectedItemId, activeTab, showSettings, toast, ...data } = state
    saveData(data)
  }, [state])

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'SET_TOAST', toast: null }), 3000)
    return () => clearTimeout(t)
  }, [state.toast])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
```

- [ ] **Step 3: Write failing reducer tests**

```ts
// src/__tests__/reducer.test.ts
import { describe, it, expect } from 'vitest'
import { reducer, INITIAL_STATE } from '../context/reducer'

describe('reducer — BU', () => {
  it('ADD_BU creates a business unit and selects it', () => {
    const state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Engineering', description: '' })
    expect(state.businessUnits).toHaveLength(1)
    expect(state.businessUnits[0].name).toBe('Engineering')
    expect(state.selectedBuId).toBe(state.businessUnits[0].id)
  })

  it('DELETE_BU removes the BU and clears selection', () => {
    let state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Eng', description: '' })
    const id = state.businessUnits[0].id
    state = reducer(state, { type: 'DELETE_BU', id })
    expect(state.businessUnits).toHaveLength(0)
    expect(state.selectedBuId).toBeNull()
  })
})

describe('reducer — Item status', () => {
  it('CHANGE_ITEM_STATUS updates statusId and creates an activity entry', () => {
    let state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Eng', description: '' })
    state = reducer(state, { type: 'ADD_PROJECT', name: 'P1', description: '', businessUnitIds: [state.businessUnits[0].id] })
    state = reducer(state, { type: 'ADD_ITEM', projectId: state.projects[0].id, title: 'My item' })
    const itemId = state.items[0].id
    state = reducer(state, { type: 'CHANGE_ITEM_STATUS', id: itemId, statusId: 'in-progress' })
    expect(state.items[0].statusId).toBe('in-progress')
    const activity = state.activityEntries.find(a => a.type === 'status_changed')
    expect(activity).toBeDefined()
    expect(activity?.description).toContain('In Progress')
  })
})

describe('reducer — SubTask', () => {
  it('TOGGLE_SUBTASK flips done and creates activity entry', () => {
    let state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Eng', description: '' })
    state = reducer(state, { type: 'ADD_PROJECT', name: 'P', description: '', businessUnitIds: [state.businessUnits[0].id] })
    state = reducer(state, { type: 'ADD_ITEM', projectId: state.projects[0].id, title: 'Item' })
    state = reducer(state, { type: 'ADD_SUBTASK', itemId: state.items[0].id, title: 'Do thing' })
    const stId = state.subTasks[0].id
    state = reducer(state, { type: 'TOGGLE_SUBTASK', id: stId })
    expect(state.subTasks[0].done).toBe(true)
    const activity = state.activityEntries.find(a => a.type === 'subtask_checked')
    expect(activity).toBeDefined()
  })
})

describe('reducer — IMPORT_DATA', () => {
  it('replaces all data and sets a success toast', () => {
    const importData = { ...INITIAL_STATE, businessUnits: [{ id: 'x', name: 'Imported BU', description: '', createdAt: '' }] }
    const state = reducer(INITIAL_STATE, { type: 'IMPORT_DATA', data: importData })
    expect(state.businessUnits[0].name).toBe('Imported BU')
    expect(state.toast?.type).toBe('success')
  })
})
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Update src/App.tsx to wrap with AppProvider**

```tsx
import { AppProvider } from './context/AppContext'

export default function App() {
  return (
    <AppProvider>
      <div className="flex items-center justify-center h-screen text-zinc-500">
        PM Tracker — context OK
      </div>
    </AppProvider>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/context/ src/__tests__/reducer.test.ts
git commit -m "feat: add app reducer, context, and reducer tests"
```

---

## Task 6: App Shell + TopBar

**Files:**
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/ThreePanel.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write src/components/ui/EmptyState.tsx**

```tsx
interface Props {
  icon: string
  title: string
  subtitle?: string
}

export default function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600 select-none">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      {subtitle && <p className="text-xs text-zinc-600">{subtitle}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Write src/components/layout/TopBar.tsx**

```tsx
import { useApp } from '../../context/AppContext'

export default function TopBar() {
  const { state, dispatch } = useApp()

  function handleExport() {
    const { selectedBuId, selectedProjectId, selectedItemId, activeTab, showSettings, toast, ...data } = state
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pmtracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    dispatch({ type: 'SET_TOAST', toast: { message: 'Backup exported', type: 'success' } })
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (!data.businessUnits || !data.statuses) throw new Error('Invalid file')
        if (confirm('This will overwrite all current data. Continue?')) {
          dispatch({ type: 'IMPORT_DATA', data })
        }
      } catch {
        dispatch({ type: 'SET_TOAST', toast: { message: 'Invalid backup file', type: 'error' } })
      }
    }
    input.click()
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700 shrink-0">
      <span className="font-bold text-teal-400 tracking-tight">PM Tracker</span>
      <div className="flex items-center gap-3">
        <button onClick={handleExport} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
          ↓ Export
        </button>
        <button onClick={handleImport} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
          ↑ Import
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Write src/components/layout/ThreePanel.tsx**

```tsx
import LeftPanel from './LeftPanel'
import MiddlePanel from './MiddlePanel'
import RightPanel from './RightPanel'

export default function ThreePanel() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <LeftPanel />
      <MiddlePanel />
      <RightPanel />
    </div>
  )
}
```

- [ ] **Step 4: Create placeholder panels (so ThreePanel compiles)**

Create `src/components/layout/LeftPanel.tsx`:
```tsx
export default function LeftPanel() {
  return <div className="w-48 bg-zinc-800 border-r border-zinc-700 shrink-0" />
}
```

Create `src/components/layout/MiddlePanel.tsx`:
```tsx
export default function MiddlePanel() {
  return <div className="w-56 bg-zinc-900 border-r border-zinc-700 shrink-0" />
}
```

Create `src/components/layout/RightPanel.tsx`:
```tsx
export default function RightPanel() {
  return <div className="flex-1 bg-zinc-900" />
}
```

- [ ] **Step 5: Write src/components/ui/Toast.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import { useEffect } from 'react'

export default function Toast() {
  const { state, dispatch } = useApp()
  const { toast } = state

  if (!toast) return null

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 transition-all ${
        toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {toast.message}
    </div>
  )
}
```

- [ ] **Step 6: Update src/App.tsx**

```tsx
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import TopBar from './components/layout/TopBar'
import ThreePanel from './components/layout/ThreePanel'
import Toast from './components/ui/Toast'
import SettingsPage from './components/settings/SettingsPage'

function Inner() {
  const { state } = useApp()
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      {state.showSettings ? <SettingsPage /> : <ThreePanel />}
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
```

- [ ] **Step 7: Create placeholder SettingsPage**

Create `src/components/settings/SettingsPage.tsx`:
```tsx
import { useApp } from '../../context/AppContext'

export default function SettingsPage() {
  const { dispatch } = useApp()
  return (
    <div className="flex-1 flex items-center justify-center text-zinc-500">
      <div className="text-center">
        <p className="text-sm mb-2">Settings — coming in Task 17</p>
        <button onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })} className="text-xs text-teal-400 hover:text-teal-300">
          ← Back
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Verify in browser**

```bash
npm run dev
```

Expected: dark shell with "PM Tracker" header, Export/Import/⚙ buttons. Three empty panels below.

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "feat: add app shell, TopBar, Export/Import, Toast"
```

---

## Task 7: Left Panel — BU Selector + Project List

**Files:**
- Create: `src/components/bu/BuSelector.tsx`
- Create: `src/components/projects/ProjectList.tsx`
- Create: `src/components/projects/ProjectListItem.tsx`
- Modify: `src/components/layout/LeftPanel.tsx`

- [ ] **Step 1: Write src/components/bu/BuSelector.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function BuSelector() {
  const { state, dispatch } = useApp()
  const { businessUnits, selectedBuId } = state
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'ADD_BU', name: name.trim(), description: '' })
    setName('')
    setAdding(false)
  }

  return (
    <div className="px-3 pt-3 pb-2 border-b border-zinc-700">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Business Units</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {businessUnits.map(bu => (
          <button
            key={bu.id}
            onClick={() => dispatch({ type: 'SELECT_BU', id: bu.id })}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              selectedBuId === bu.id
                ? 'bg-teal-500 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {bu.name}
          </button>
        ))}
      </div>
      {adding ? (
        <form onSubmit={submit} className="flex gap-1">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Unit name"
            className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
          />
          <button type="submit" className="text-xs text-teal-400 hover:text-teal-300 px-1">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400">
          + New Unit
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write src/components/projects/ProjectListItem.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import type { Project } from '../../types'

interface Props { project: Project }

export default function ProjectListItem({ project }: Props) {
  const { state, dispatch } = useApp()
  const isSelected = state.selectedProjectId === project.id

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_PROJECT', id: project.id })}
      className={`w-full text-left px-3 py-2 rounded-r transition-colors border-l-2 ${
        isSelected
          ? 'border-teal-500 bg-zinc-700 text-white'
          : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
      }`}
    >
      <p className="text-xs font-medium truncate">{project.name}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">
        {state.items.filter(i => i.projectId === project.id).length} items
      </p>
    </button>
  )
}
```

- [ ] **Step 3: Write src/components/projects/ProjectList.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ProjectListItem from './ProjectListItem'

export default function ProjectList() {
  const { state, dispatch } = useApp()
  const { selectedBuId, projects } = state
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const filtered = selectedBuId
    ? projects.filter(p => p.businessUnitIds.includes(selectedBuId))
    : projects

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !selectedBuId) return
    dispatch({ type: 'ADD_PROJECT', name: name.trim(), description: '', businessUnitIds: [selectedBuId] })
    setName('')
    setAdding(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 px-3 pt-3 pb-1">Projects</p>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[11px] text-zinc-600 px-3 py-2">
            {selectedBuId ? 'No projects yet' : 'Select a unit first'}
          </p>
        ) : (
          filtered.map(p => <ProjectListItem key={p.id} project={p} />)
        )}
      </div>
      {selectedBuId && (
        <div className="px-3 pb-3 pt-2 border-t border-zinc-700">
          {adding ? (
            <form onSubmit={submit} className="flex gap-1">
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Project name"
                className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
              />
              <button type="submit" className="text-xs text-teal-400 px-1">Add</button>
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-zinc-500 px-1">✕</button>
            </form>
          ) : (
            <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400">
              + New Project
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Write src/components/projects/ProjectDocsLinks.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function ProjectDocsLinks() {
  const { state, dispatch } = useApp()
  const project = state.projects.find(p => p.id === state.selectedProjectId)
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  if (!project) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !url.trim() || !project) return
    dispatch({ type: 'ADD_PROJECT_DOC', projectId: project.id, label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
    setAdding(false)
  }

  return (
    <div className="border-t border-zinc-700 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Docs &amp; Links</p>
      {project.docs.map(doc => (
        <div key={doc.id} className="flex items-center gap-1 mb-1 group">
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-[11px] text-teal-400 hover:text-teal-300 truncate">
            → {doc.label}
          </a>
          <button
            onClick={() => dispatch({ type: 'DELETE_PROJECT_DOC', projectId: project.id, docId: doc.id })}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[10px] transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={submit} className="flex flex-col gap-1 mt-1">
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" className="text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <div className="flex gap-1">
            <button type="submit" className="text-xs text-teal-400">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-zinc-500">✕</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[11px] text-zinc-500 hover:text-teal-500">+ Add link</button>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Update src/components/layout/LeftPanel.tsx**

```tsx
import BuSelector from '../bu/BuSelector'
import ProjectList from '../projects/ProjectList'
import ProjectDocsLinks from '../projects/ProjectDocsLinks'
import { useApp } from '../../context/AppContext'

export default function LeftPanel() {
  const { state } = useApp()
  return (
    <div className="w-48 bg-zinc-800 border-r border-zinc-700 shrink-0 flex flex-col overflow-hidden">
      <BuSelector />
      <ProjectList />
      {state.selectedProjectId && <ProjectDocsLinks />}
    </div>
  )
}
```

- [ ] **Step 6: Verify in browser**

Create a BU, create a project. Confirm selection highlights work and Docs & Links appears.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add left panel — BU selector, project list, docs & links"
```

---

## Task 8: Middle Panel — Items

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/items/StatusFilterTabs.tsx`
- Create: `src/components/items/ItemCard.tsx`
- Create: `src/components/items/ItemList.tsx`
- Modify: `src/components/layout/MiddlePanel.tsx`

- [ ] **Step 1: Write src/components/ui/Badge.tsx**

```tsx
interface Props { label: string; color: string }

export default function Badge({ label, color }: Props) {
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
      style={{ background: `${color}22`, color }}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Write src/components/items/StatusFilterTabs.tsx**

```tsx
import { useApp } from '../../context/AppContext'

interface Props {
  activeStatusId: string | 'all'
  onChange: (id: string | 'all') => void
}

export default function StatusFilterTabs({ activeStatusId, onChange }: Props) {
  const { state } = useApp()
  const projectId = state.selectedProjectId
  const statuses = state.statuses.filter(
    s => s.scope === 'global' || s.projectId === projectId
  ).sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-wrap gap-1 px-3 py-2">
      {[{ id: 'all', label: 'All' }, ...statuses].map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
            activeStatusId === s.id
              ? 'bg-teal-500 text-white border-teal-500'
              : 'border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write src/components/items/ItemCard.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import type { Item } from '../../types'
import Badge from '../ui/Badge'
import { formatDate } from '../../utils/date'

interface Props { item: Item }

export default function ItemCard({ item }: Props) {
  const { state, dispatch } = useApp()
  const isSelected = state.selectedItemId === item.id
  const status = state.statuses.find(s => s.id === item.statusId)
  const subTasks = state.subTasks.filter(st => st.itemId === item.id)
  const doneSubs = subTasks.filter(st => st.done).length
  const isDone = status?.id === 'done'

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_ITEM', id: item.id })}
      className={`w-full text-left px-3 py-2 rounded-r border-l-2 transition-colors mb-1 ${
        isSelected
          ? 'border-teal-500 bg-zinc-700 text-white'
          : 'border-transparent hover:bg-zinc-800 text-zinc-400'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-medium ${isDone ? 'line-through text-zinc-600' : isSelected ? 'text-white' : 'text-zinc-300'}`}>
          {item.title}
        </span>
        {status && <Badge label={status.label} color={status.color} />}
      </div>
      <div className="flex gap-2 mt-1 text-[10px] text-zinc-600">
        {item.deadline && <span>⏰ {formatDate(item.deadline)}</span>}
        {subTasks.length > 0 && <span>{doneSubs}/{subTasks.length} tasks</span>}
      </div>
    </button>
  )
}
```

- [ ] **Step 4: Write src/components/items/ItemList.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ItemCard from './ItemCard'
import StatusFilterTabs from './StatusFilterTabs'
import EmptyState from '../ui/EmptyState'

export default function ItemList() {
  const { state, dispatch } = useApp()
  const { selectedProjectId, items } = state
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all')
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  const project = state.projects.find(p => p.id === selectedProjectId)
  const projectItems = items
    .filter(i => i.projectId === selectedProjectId)
    .filter(i => filterStatus === 'all' || i.statusId === filterStatus)
    .sort((a, b) => {
      const aIsDone = a.statusId === 'done' ? 1 : 0
      const bIsDone = b.statusId === 'done' ? 1 : 0
      return aIsDone - bIsDone || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedProjectId) return
    dispatch({ type: 'ADD_ITEM', projectId: selectedProjectId, title: title.trim() })
    setTitle('')
    setAdding(false)
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon="📋" title="Select a project" subtitle="Choose from the left panel" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-1 border-b border-zinc-700">
        <p className="text-xs font-semibold text-zinc-200 truncate">{project.name}</p>
      </div>
      <StatusFilterTabs activeStatusId={filterStatus} onChange={setFilterStatus} />
      <div className="flex-1 overflow-y-auto px-1">
        {projectItems.length === 0 ? (
          <EmptyState icon="✨" title="No items" subtitle="Add one below" />
        ) : (
          projectItems.map(item => <ItemCard key={item.id} item={item} />)
        )}
      </div>
      <div className="px-3 py-2 border-t border-zinc-700">
        {adding ? (
          <form onSubmit={submit} className="flex gap-1">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Item title"
              className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
            />
            <button type="submit" className="text-xs text-teal-400">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-zinc-500">✕</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400">
            + New Item
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update src/components/layout/MiddlePanel.tsx**

```tsx
import ItemList from '../items/ItemList'

export default function MiddlePanel() {
  return (
    <div className="w-56 bg-zinc-900 border-r border-zinc-700 shrink-0 flex flex-col overflow-hidden">
      <ItemList />
    </div>
  )
}
```

- [ ] **Step 6: Verify in browser**

Create an item. Confirm it appears with Backlog badge. Click it to select.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add middle panel — item list, status filter, item cards"
```

---

## Task 9: Right Panel — Item Header + Tabs

**Files:**
- Create: `src/components/items/ItemHeader.tsx`
- Create: `src/components/detail/TabBar.tsx`
- Modify: `src/components/layout/RightPanel.tsx`

- [ ] **Step 1: Write src/components/items/ItemHeader.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import { formatDate } from '../../utils/date'

export default function ItemHeader() {
  const { state, dispatch } = useApp()
  const item = state.items.find(i => i.id === state.selectedItemId)
  const status = state.statuses.find(s => s.id === item?.statusId)
  const projectStatuses = state.statuses
    .filter(s => s.scope === 'global' || s.projectId === item?.projectId)
    .sort((a, b) => a.order - b.order)

  if (!item) return null

  return (
    <div className="px-4 py-3 border-b border-zinc-700 shrink-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <input
          value={item.title}
          onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, title: e.target.value })}
          className="flex-1 text-sm font-semibold text-white bg-transparent outline-none border-b border-transparent focus:border-teal-500 transition-colors"
        />
        <select
          value={item.statusId}
          onChange={e => dispatch({ type: 'CHANGE_ITEM_STATUS', id: item.id, statusId: e.target.value })}
          className="text-[10px] rounded-full px-2 py-0.5 border outline-none cursor-pointer"
          style={{ background: `${status?.color ?? '#71717a'}22`, color: status?.color ?? '#71717a', borderColor: `${status?.color ?? '#71717a'}55` }}
        >
          {projectStatuses.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#27272a', color: '#fafafa' }}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-zinc-500">
        <label className="flex items-center gap-1">
          ⏰
          <input
            type="date"
            value={item.deadline ? item.deadline.slice(0, 10) : ''}
            onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: e.target.value || null })}
            className="bg-transparent text-zinc-400 outline-none cursor-pointer hover:text-zinc-200"
          />
        </label>
        {item.deadline && (
          <button
            onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: null })}
            className="text-zinc-600 hover:text-red-400"
          >
            clear
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write src/components/detail/TabBar.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import type { TabId } from '../../types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'subtasks',     label: 'Sub-tasks' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'links',        label: 'Links' },
  { id: 'activity',     label: 'Activity' },
]

export default function TabBar() {
  const { state, dispatch } = useApp()
  return (
    <div className="flex border-b border-zinc-700 shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: tab.id })}
          className={`px-3 py-2 text-[11px] border-b-2 transition-colors ${
            state.activeTab === tab.id
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Update src/components/layout/RightPanel.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import ItemHeader from '../items/ItemHeader'
import TabBar from '../detail/TabBar'
import SubTasksTab from '../detail/SubTasksTab'
import ConversationTab from '../detail/ConversationTab'
import LinksTab from '../detail/LinksTab'
import ActivityTab from '../detail/ActivityTab'
import EmptyState from '../ui/EmptyState'

export default function RightPanel() {
  const { state } = useApp()
  const { selectedItemId, activeTab } = state

  if (!selectedItemId) {
    return (
      <div className="flex-1 bg-zinc-900 flex items-center justify-center">
        <EmptyState icon="👆" title="Select an item" subtitle="Pick one from the middle panel" />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-zinc-900 flex flex-col overflow-hidden">
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
}
```

- [ ] **Step 4: Create placeholder tabs (so RightPanel compiles)**

Create `src/components/detail/SubTasksTab.tsx`:
```tsx
export default function SubTasksTab() {
  return <div className="p-4 text-zinc-600 text-xs">Sub-tasks — Task 10</div>
}
```

Create `src/components/detail/ConversationTab.tsx`:
```tsx
export default function ConversationTab() {
  return <div className="p-4 text-zinc-600 text-xs">Conversation — Task 11</div>
}
```

Create `src/components/detail/LinksTab.tsx`:
```tsx
export default function LinksTab() {
  return <div className="p-4 text-zinc-600 text-xs">Links — Task 12</div>
}
```

Create `src/components/detail/ActivityTab.tsx`:
```tsx
export default function ActivityTab() {
  return <div className="p-4 text-zinc-600 text-xs">Activity — Task 13</div>
}
```

- [ ] **Step 5: Verify in browser**

Select an item. Confirm header shows title, status dropdown, date picker. Tabs appear.

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: add right panel shell — item header, tabs, status dropdown"
```

---

## Task 10: Sub-tasks Tab

**Files:**
- Modify: `src/components/detail/SubTasksTab.tsx`

- [ ] **Step 1: Replace SubTasksTab.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function SubTasksTab() {
  const { state, dispatch } = useApp()
  const { selectedItemId } = state
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  if (!selectedItemId) return null

  const subTasks = state.subTasks
    .filter(st => st.itemId === selectedItemId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const pending = subTasks.filter(st => !st.done)
  const done = subTasks.filter(st => st.done)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    dispatch({ type: 'ADD_SUBTASK', itemId: selectedItemId!, title: title.trim() })
    setTitle('')
  }

  return (
    <div className="p-4">
      {pending.map(st => (
        <label key={st.id} className="flex items-center gap-2 mb-2 group cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={() => dispatch({ type: 'TOGGLE_SUBTASK', id: st.id })}
            className="accent-teal-500 w-3.5 h-3.5"
          />
          <span className="text-xs text-zinc-300 flex-1">{st.title}</span>
          <button
            onClick={() => dispatch({ type: 'DELETE_SUBTASK', id: st.id })}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[10px]"
          >
            ✕
          </button>
        </label>
      ))}

      {done.length > 0 && (
        <>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-3 mb-2">Done</p>
          {done.map(st => (
            <label key={st.id} className="flex items-center gap-2 mb-2 group cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                onChange={() => dispatch({ type: 'TOGGLE_SUBTASK', id: st.id })}
                className="accent-teal-500 w-3.5 h-3.5"
              />
              <span className="text-xs text-zinc-600 line-through flex-1">{st.title}</span>
            </label>
          ))}
        </>
      )}

      {adding ? (
        <form onSubmit={submit} className="flex gap-1 mt-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Sub-task title"
            className="flex-1 text-xs bg-zinc-800 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
          />
          <button type="submit" className="text-xs text-teal-400">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="text-xs text-zinc-500">✕</button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400 mt-3">
          + Add sub-task
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Add sub-tasks, check/uncheck them. Confirm done tasks move to "Done" section.

- [ ] **Step 3: Commit**

```bash
git add src/components/detail/SubTasksTab.tsx
git commit -m "feat: add sub-tasks tab with checkbox CRUD"
```

---

## Task 11: Conversation Tab

**Files:**
- Create: `src/components/detail/ConversationBubble.tsx`
- Create: `src/components/detail/ConversationCompose.tsx`
- Modify: `src/components/detail/ConversationTab.tsx`

- [ ] **Step 1: Write src/components/detail/ConversationBubble.tsx**

```tsx
import { formatDateTime } from '../../utils/date'
import type { ConversationEntry } from '../../types'

interface Props { entry: ConversationEntry }

export default function ConversationBubble({ entry }: Props) {
  return (
    <div className="mb-4">
      <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">
        {formatDateTime(entry.createdAt)}
      </p>
      <div
        className="bg-zinc-800 border border-zinc-700 rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl px-3 py-2 text-xs text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Write src/components/detail/ConversationCompose.tsx**

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useApp } from '../../context/AppContext'

interface Props { itemId: string }

export default function ConversationCompose({ itemId }: Props) {
  const { dispatch } = useApp()

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    editorProps: {
      attributes: { class: 'tiptap min-h-[60px] px-2 py-1' },
    },
  })

  function submit() {
    if (!editor || editor.isEmpty) return
    dispatch({ type: 'ADD_CONVERSATION_ENTRY', itemId, content: editor.getHTML() })
    editor.commands.clearContent()
  }

  return (
    <div className="border-t border-zinc-700 p-3">
      <div className="flex gap-1 mb-2">
        {[
          { label: 'B', action: () => editor?.chain().focus().toggleBold().run() },
          { label: 'I', action: () => editor?.chain().focus().toggleItalic().run() },
          { label: 'U', action: () => editor?.chain().focus().toggleUnderline().run() },
          { label: '•', action: () => editor?.chain().focus().toggleBulletList().run() },
        ].map(({ label, action }) => (
          <button key={label} onClick={action} className="text-xs text-zinc-500 hover:text-zinc-200 border border-zinc-700 rounded px-1.5 py-0.5 transition-colors">
            {label}
          </button>
        ))}
      </div>
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden mb-2">
        <EditorContent editor={editor} />
      </div>
      <div className="flex justify-end">
        <button
          onClick={submit}
          className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
        >
          Add entry
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace src/components/detail/ConversationTab.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import ConversationBubble from './ConversationBubble'
import ConversationCompose from './ConversationCompose'
import EmptyState from '../ui/EmptyState'
import { useEffect, useRef } from 'react'

export default function ConversationTab() {
  const { state } = useApp()
  const { selectedItemId, conversationEntries } = state
  const bottomRef = useRef<HTMLDivElement>(null)

  if (!selectedItemId) return null

  const entries = conversationEntries
    .filter(e => e.itemId === selectedItemId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <EmptyState icon="💬" title="No entries yet" subtitle="Add a note below" />
        ) : (
          entries.map(e => <ConversationBubble key={e.id} entry={e} />)
        )}
        <div ref={bottomRef} />
      </div>
      <ConversationCompose itemId={selectedItemId} />
    </div>
  )
}
```

- [ ] **Step 4: Verify in browser**

Click "Conversation" tab. Add a rich-text entry. Confirm it appears as a bubble with timestamp. Bold/italic formatting should persist.

- [ ] **Step 5: Commit**

```bash
git add src/components/detail/
git commit -m "feat: add conversation tab with Tiptap rich text"
```

---

## Task 12: Links Tab

**Files:**
- Modify: `src/components/detail/LinksTab.tsx`

- [ ] **Step 1: Replace LinksTab.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function LinksTab() {
  const { state, dispatch } = useApp()
  const { selectedItemId } = state
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  if (!selectedItemId) return null

  const item = state.items.find(i => i.id === selectedItemId)
  if (!item) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !url.trim()) return
    dispatch({ type: 'ADD_ITEM_LINK', itemId: selectedItemId!, label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
    setAdding(false)
  }

  return (
    <div className="p-4">
      {item.links.length === 0 && !adding && (
        <p className="text-xs text-zinc-600 mb-3">No links added yet.</p>
      )}
      {item.links.map(link => (
        <div key={link.id} className="flex items-center gap-2 mb-2 group">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs text-teal-400 hover:text-teal-300 truncate">
            → {link.label}
          </a>
          <span className="text-[10px] text-zinc-600 truncate max-w-[120px]">{link.url}</span>
          <button
            onClick={() => dispatch({ type: 'DELETE_ITEM_LINK', itemId: selectedItemId!, linkId: link.id })}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[10px]"
          >
            ✕
          </button>
        </div>
      ))}
      {adding ? (
        <form onSubmit={submit} className="flex flex-col gap-1 mt-2">
          <input autoFocus value={label} onChange={e => setLabel(e.target.value)} placeholder="Label" className="text-xs bg-zinc-800 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="text-xs bg-zinc-800 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500" />
          <div className="flex gap-2">
            <button type="submit" className="text-xs text-teal-400">Add</button>
            <button type="button" onClick={() => setAdding(false)} className="text-xs text-zinc-500">✕</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400 mt-2">
          + Add link
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Add a link. Confirm it opens in a new tab. Delete it. Confirm it's removed.

- [ ] **Step 3: Commit**

```bash
git add src/components/detail/LinksTab.tsx
git commit -m "feat: add links tab with add/delete item links"
```

---

## Task 13: Activity Tab

**Files:**
- Modify: `src/components/detail/ActivityTab.tsx`

- [ ] **Step 1: Replace ActivityTab.tsx**

```tsx
import { useApp } from '../../context/AppContext'
import { formatDateTime } from '../../utils/date'
import type { ActivityType } from '../../types'
import EmptyState from '../ui/EmptyState'

const DOT_COLORS: Record<ActivityType, string> = {
  item_created:      '#14b8a6',
  status_changed:    '#14b8a6',
  subtask_checked:   '#6366f1',
  subtask_unchecked: '#6366f1',
  note_added:        '#f59e0b',
  link_added:        '#ec4899',
  link_removed:      '#ec4899',
  deadline_set:      '#f97316',
  deadline_cleared:  '#f97316',
}

export default function ActivityTab() {
  const { state } = useApp()
  const { selectedItemId, activityEntries } = state

  if (!selectedItemId) return null

  const entries = activityEntries
    .filter(a => a.itemId === selectedItemId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (entries.length === 0) {
    return <EmptyState icon="📋" title="No activity yet" />
  }

  return (
    <div className="p-4">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex gap-3 mb-0">
          <div className="flex flex-col items-center">
            <div
              className="w-2 h-2 rounded-full mt-1 shrink-0"
              style={{ background: DOT_COLORS[entry.type] ?? '#71717a' }}
            />
            {idx < entries.length - 1 && (
              <div className="w-px flex-1 bg-zinc-700 mt-1" />
            )}
          </div>
          <div className="pb-4 flex-1">
            <p className="text-xs text-zinc-300">{entry.description}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{formatDateTime(entry.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Create an item, change its status, check a sub-task, add a link. Click Activity tab. Confirm all events appear with coloured dots.

- [ ] **Step 3: Commit**

```bash
git add src/components/detail/ActivityTab.tsx
git commit -m "feat: add activity tab with coloured timeline"
```

---

## Task 14: Settings Page — Status Manager

**Files:**
- Modify: `src/components/settings/SettingsPage.tsx`

- [ ] **Step 1: Replace SettingsPage.tsx**

```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const PRESET_COLORS = ['#71717a', '#f59e0b', '#6366f1', '#14b8a6', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#3b82f6', '#22c55e']

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [scope, setScope] = useState<'global' | 'project'>('global')

  const statuses = [...state.statuses].sort((a, b) => a.order - b.order)

  function addStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    dispatch({ type: 'ADD_STATUS', label: label.trim(), color, scope })
    setLabel('')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-semibold text-white">Settings</h1>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Statuses</h2>

        <div className="bg-zinc-800 rounded-lg border border-zinc-700 divide-y divide-zinc-700 mb-4">
          {statuses.map(status => (
            <div key={status.id} className="flex items-center gap-3 px-4 py-3">
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
        </div>

        <form onSubmit={addStatus} className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
          <p className="text-xs font-medium text-zinc-400 mb-3">Add custom status</p>
          <div className="flex gap-2 mb-3">
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Status label"
              className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1.5 outline-none focus:border-teal-500"
            />
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex gap-1 mb-3 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-zinc-500">Scope:</span>
            {(['global', 'project'] as const).map(s => (
              <label key={s} className="flex items-center gap-1 text-xs text-zinc-300 cursor-pointer">
                <input type="radio" value={s} checked={scope === s} onChange={() => setScope(s)} className="accent-teal-500" />
                {s === 'global' ? 'Global (all projects)' : 'Current project'}
              </label>
            ))}
          </div>
          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors">
            Add status
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open Settings (⚙). Confirm 4 default statuses show with lock icon. Add a custom status. Confirm it appears in item status dropdown. Try deleting a default status — confirm it's blocked.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/SettingsPage.tsx
git commit -m "feat: add settings page with status manager"
```

---

## Task 15: First-Launch Welcome + Empty States

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add first-launch detection to App.tsx**

Replace `src/App.tsx`:

```tsx
import { AppProvider, useApp } from './context/AppContext'
import TopBar from './components/layout/TopBar'
import ThreePanel from './components/layout/ThreePanel'
import Toast from './components/ui/Toast'
import SettingsPage from './components/settings/SettingsPage'

function Welcome() {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'ADD_BU', name: name.trim(), description: '' })
  }
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <p className="text-3xl mb-3">📋</p>
        <h1 className="text-lg font-bold text-white mb-1">Welcome to PM Tracker</h1>
        <p className="text-sm text-zinc-500 mb-6">Your personal PM diary. Start by creating a Business Unit.</p>
        <form onSubmit={submit} className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Engineering, Marketing…"
            className="flex-1 text-sm bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-lg px-3 py-2 outline-none focus:border-teal-500"
          />
          <button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}

function Inner() {
  const { state } = useApp()
  const isFirstLaunch = state.businessUnits.length === 0 && !state.showSettings
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      {state.showSettings
        ? <SettingsPage />
        : isFirstLaunch
          ? <Welcome />
          : <ThreePanel />}
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
```

Add `import { useState } from 'react'` at the top.

- [ ] **Step 2: Verify in browser**

Clear localStorage (`localStorage.clear()` in DevTools console, refresh). Confirm welcome screen appears. Create a BU. Confirm it navigates to the three-panel view.

- [ ] **Step 3: Run final type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add first-launch welcome screen"
```

---

## Task 16: Production Build + Deploy Prep

**Files:**
- Create: `.github/workflows/deploy.yml` (optional — only if deploying to GitHub Pages)

- [ ] **Step 1: Build the app**

```bash
npm run build
```

Expected: `dist/` folder created, no build errors.

- [ ] **Step 2: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4173`. Test the full flow: create BU → project → item → sub-task → conversation entry → change status → activity log.

- [ ] **Step 3 (optional): Configure for GitHub Pages**

If deploying to GitHub Pages, update `vite.config.ts` to set a base path matching the repo name:

```ts
export default defineConfig({
  plugins: [react()],
  base: '/pm-tracker/',   // replace with actual repo name
  test: { environment: 'jsdom', globals: true },
})
```

- [ ] **Step 4 (optional): Add GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: production build verified, deploy config added"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| Business Unit top-level | Task 7 |
| Projects (name, description, BU assignment) | Task 7 |
| Items with status, deadline | Task 8, 9 |
| Sub-tasks as checkboxes | Task 10 |
| Conversation: chronological, chat-style, rich text | Task 11 |
| Links per item | Task 12 |
| Activity log (auto-generated) | Task 13 |
| Project Docs & Links | Task 7 |
| Status: 4 defaults + custom global/project | Task 14 |
| 3-panel layout | Task 6, 7, 8, 9 |
| Export/Import JSON backup | Task 6 (TopBar) |
| Theme B (zinc/teal) | Task 1 (Tailwind) |
| localStorage persistence | Task 3, 5 |
| First-launch welcome | Task 15 |
| Production build | Task 16 |

All spec requirements are covered. ✓

### Placeholder scan

No TBDs, no "similar to Task N" references, all code blocks are complete. ✓

### Type consistency

- `DocLink` used in `Project.docs`, `Item.links`, `ADD_PROJECT_DOC`, `ADD_ITEM_LINK` — consistent ✓
- `TabId` union matches `SET_ACTIVE_TAB` action and `TabBar` — consistent ✓
- `ActivityType` used in `ActivityEntry`, `DOT_COLORS`, `createActivityEntry` — consistent ✓
- `CHANGE_ITEM_STATUS` action uses `statusId: string` matching `Item.statusId: string` — consistent ✓
