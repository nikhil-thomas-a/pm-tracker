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
        {item.deadline && (
          <span className={overdue ? 'text-red-400' : ''}>
            ⏰ {formatDate(item.deadline)}{overdue && ' · overdue'}
          </span>
        )}
        {subTasks.length > 0 && <span>{doneSubs}/{subTasks.length} tasks</span>}
      </div>
    </button>
  )
}
