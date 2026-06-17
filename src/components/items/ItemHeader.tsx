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
    <div className="px-4 py-3 border-b border-pm-border-subtle shrink-0">
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
          className="flex-1 text-[13px] font-semibold text-pm-text bg-transparent outline-none border-b border-transparent focus:border-pm-accent transition-colors"
          style={{ letterSpacing: '-0.01em' }}
        />
        <select
          value={item.statusId}
          onChange={e => dispatch({ type: 'CHANGE_ITEM_STATUS', id: item.id, statusId: e.target.value })}
          className="text-[10px] rounded-full px-2 py-0.5 border outline-none cursor-pointer"
          style={{ background: `${status?.color ?? '#71717a'}22`, color: status?.color ?? '#71717a', borderColor: `${status?.color ?? '#71717a'}55` }}
        >
          {projectStatuses.map(s => (
            <option key={s.id} value={s.id} style={{ background: 'var(--pm-surface)', color: 'var(--pm-text)' }}>
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
        className="w-full mt-1 text-[11px] text-pm-text-2 placeholder-pm-muted bg-transparent outline-none resize-none border-b border-transparent focus:border-pm-border transition-colors pb-0.5"
      />
      <div className="flex items-center gap-4 text-[10px] text-pm-muted mt-2">
        <label className={`flex items-center gap-1 ${item.deadline && isOverdue(item.deadline) ? 'text-pm-danger' : ''}`}>
          ⏰
          <input
            type="date"
            value={item.deadline ? item.deadline.slice(0, 10) : ''}
            onChange={e => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: e.target.value || null })}
            className="bg-transparent outline-none cursor-pointer hover:text-pm-text-2 transition-colors"
          />
        </label>
        {item.deadline && (
          <button
            onClick={() => dispatch({ type: 'UPDATE_ITEM', id: item.id, deadline: null })}
            className="text-pm-muted hover:text-pm-danger transition-colors"
          >
            clear
          </button>
        )}
      </div>
    </div>
  )
}
