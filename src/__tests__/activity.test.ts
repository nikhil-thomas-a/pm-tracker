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
