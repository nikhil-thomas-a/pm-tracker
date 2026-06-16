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
