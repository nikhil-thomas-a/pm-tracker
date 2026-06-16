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
