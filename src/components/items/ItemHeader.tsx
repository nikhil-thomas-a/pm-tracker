import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { isOverdue } from '../../utils/date'

export default function ItemHeader() {
  const { state, dispatch } = useApp()
  const item = state.items.find(i => i.id === state.selectedItemId)
  const status = state.statuses.find(s => s.id === item?.statusId)
  const projectStatuses = state.statuses
    .filter(s => s.scope === 'global' || s.projectId === item?.projectId)
    .sort((a, b) => a.order - b.order)

  const [localTitle, setLocalTitle] = useState(item?.title ?? '')
  const [localDesc, setLocalDesc] = useState(item?.description ?? '')

  useEffect(() => {
    setLocalTitle(item?.title ?? '')
    setLocalDesc(item?.description ?? '')
  }, [item?.id])

  if (!item) return null

  return (
    <div className="px-4 py-3 border-b border-zinc-700 shrink-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <input
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          onBlur={e => {
            const trimmed = e.target.value.trim()
            if (trimmed && trimmed !== item.title) {
              dispatch({ type: 'UPDATE_ITEM', id: item.id, title: trimmed })
            } else {
              setLocalTitle(item.title)
            }
          }}
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
      <textarea
        value={localDesc}
        onChange={e => setLocalDesc(e.target.value)}
        onBlur={e => {
          const trimmed = e.target.value.trim()
          if (trimmed !== item.description) {
            dispatch({ type: 'UPDATE_ITEM', id: item.id, description: trimmed })
          }
        }}
        placeholder="Add a description…"
        rows={2}
        className="w-full mt-1 text-xs text-zinc-400 placeholder-zinc-600 bg-transparent outline-none resize-none border-b border-transparent focus:border-zinc-600 transition-colors pb-0.5"
      />
      <div className="flex items-center gap-4 text-[10px] text-zinc-500 mt-2">
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
