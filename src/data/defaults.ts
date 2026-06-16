import type { Status } from '../types'

export const DEFAULT_STATUSES: Status[] = [
  { id: 'backlog',      label: 'Backlog',      color: '#71717a', scope: 'global', isDefault: true, order: 0 },
  { id: 'in-progress',  label: 'In Progress',  color: '#f59e0b', scope: 'global', isDefault: true, order: 1 },
  { id: 'in-review',   label: 'In Review',    color: '#6366f1', scope: 'global', isDefault: true, order: 2 },
  { id: 'done',        label: 'Done',         color: '#14b8a6', scope: 'global', isDefault: true, order: 3 },
]
