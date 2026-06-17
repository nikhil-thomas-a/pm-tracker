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
