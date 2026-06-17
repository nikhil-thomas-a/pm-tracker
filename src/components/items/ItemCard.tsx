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
      className={`group w-full text-left px-3 py-1.5 border-l-2 transition-colors mb-px ${
        isSelected
          ? 'border-pm-accent bg-pm-surface-up'
          : 'border-transparent hover:bg-pm-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-xs font-medium flex-1 ${isDone ? 'line-through text-pm-dim' : isSelected ? 'text-pm-text' : 'text-pm-text-2'}`}>
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
            ⏰ {formatDate(item.deadline)}{overdue && ' · overdue'}
          </span>
        )}
        {subTasks.length > 0 && <span>{doneSubs}/{subTasks.length} tasks</span>}
      </div>
    </button>
  )
}
