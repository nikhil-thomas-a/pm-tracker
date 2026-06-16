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
