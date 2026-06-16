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
