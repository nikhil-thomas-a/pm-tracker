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
          bu.id === action.id
            ? { ...bu, ...(action.name !== undefined && { name: action.name }), ...(action.description !== undefined && { description: action.description }) }
            : bu
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
            ? { ...p, ...(action.name !== undefined && { name: action.name }), ...(action.description !== undefined && { description: action.description }), ...(action.businessUnitIds !== undefined && { businessUnitIds: action.businessUnitIds }), updatedAt: nowISO() }
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
      const status = { id: generateId(), label: action.label, color: action.color, scope: action.scope, ...(action.projectId !== undefined && { projectId: action.projectId }), isDefault: false, order: maxOrder + 1 }
      return { ...state, statuses: [...state.statuses, status] }
    }
    case 'UPDATE_STATUS':
      return {
        ...state,
        statuses: state.statuses.map(s =>
          s.id === action.id ? { ...s, ...(action.label !== undefined && { label: action.label }), ...(action.color !== undefined && { color: action.color }) } : s
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
