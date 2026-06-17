import { useApp } from '../../context/AppContext'
import { isOverdue } from '../../utils/date'

export default function ItemHeader() {
  const { state, dispatch } = useApp()
  const item = state.items.find(i => i.id === state.selectedItemId)
  const status = state.statuses.find(s => s.id === item?.statusId)
  const projectStatuses = state.statuses
    .filter(s => s.scope === 'global' || s.projectId === item?.projectId)
    .sort((a, b) => a.order - b.order)

  if (!item) return null

  return (
    <div className="px-4 py-3 border-b border-zinc-700 shrink-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <input
          value={item.title}
          onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, title: e.target.value })}
          className="flex-1 text-sm font-semibold text-white bg-transparent outline-none border-b border-transparent focus:border-teal-500 transition-colors"
        />
        <select
          value={item.statusId}
          onChange={e => dispatch({ type: 'CHANGE_ITEM_STATUS', id: item.id, statusId: e.target.value })}
          className="text-[10px] rounded-full px-2 py-0.5 border outline-none cursor-pointer"
          style={{ background: `${status?.color ?? '#71717a'}22`, color: status?.color ?? '#71717a', borderColor: `${status?.color ?? '#71717a'}55` }}
        >
          {projectStatuses.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#27272a', color: '#fafafa' }}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-zinc-500">
        <label className={`flex items-center gap-1 ${item.deadline && isOverdue(item.deadline) ? 'text-red-400' : ''}`}>
          ⏰
          <input
            type="date"
            value={item.deadline ? item.deadline.slice(0, 10) : ''}
            onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: e.target.value || null })}
            className="bg-transparent text-zinc-400 outline-none cursor-pointer hover:text-zinc-200"
          />
        </label>
        {item.deadline && (
          <button
            onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: null })}
            className="text-zinc-600 hover:text-red-400"
          >
            clear
          </button>
        )}
      </div>
    </div>
  )
}
