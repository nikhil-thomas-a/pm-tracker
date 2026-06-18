import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const PRESET_COLORS = ['#71717a', '#f59e0b', '#6366f1', '#14b8a6', '#ef4444', '#f97316', '#8b5cf6', '#ec4899', '#3b82f6', '#22c55e']

export default function SettingsPage() {
  const { state, dispatch } = useApp()
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [scope, setScope] = useState<'global' | 'project'>('global')
  const [dragId, setDragId] = useState<string | null>(null)

  const statuses = [...state.statuses].sort((a, b) => a.order - b.order)
  const [orderedIds, setOrderedIds] = useState<string[]>(() => statuses.map(s => s.id))

  useEffect(() => {
    setOrderedIds(statuses.map(s => s.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses.map(s => s.id).join(',')])

  function addStatus(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    dispatch({ type: 'ADD_STATUS', label: label.trim(), color, scope })
    setLabel('')
  }

  function handleDragStart(id: string) { setDragId(id) }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault()
    if (!dragId || dragId === overId) return
    setOrderedIds(prev => {
      const ids = [...prev]
      const from = ids.indexOf(dragId)
      const to = ids.indexOf(overId)
      if (from === -1 || to === -1) return prev
      ids.splice(from, 1)
      ids.splice(to, 0, dragId)
      return ids
    })
  }

  function handleDragEnd() {
    if (dragId) dispatch({ type: 'REORDER_STATUSES', ids: orderedIds })
    setDragId(null)
  }

  const displayedStatuses = orderedIds
    .map(id => statuses.find(s => s.id === id))
    .filter((s): s is typeof statuses[0] => s !== undefined)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[15px] font-semibold text-pm-text">Settings</h1>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="text-[13px] text-pm-muted hover:text-pm-text-2"
          >
            ← Back
          </button>
        </div>

        <h2 className="text-[11px] font-medium text-pm-muted uppercase tracking-[0.1em] mb-3">Statuses</h2>
        <p className="text-[12px] text-pm-muted mb-2">Drag to reorder</p>

        <div className="bg-pm-surface rounded-lg border border-pm-border divide-y divide-pm-border mb-4">
          {displayedStatuses.map(status => (
            <div
              key={status.id}
              draggable
              onDragStart={() => handleDragStart(status.id)}
              onDragOver={e => handleDragOver(e, status.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 px-4 py-3 cursor-grab select-none ${dragId === status.id ? 'opacity-50' : ''}`}
            >
              <span className="text-pm-muted text-[13px]">⠿</span>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: status.color }} />
              <span className="text-pm-text-2 flex-1">{status.label}</span>
              <span className="text-[12px] text-pm-muted">{status.scope}</span>
              {!status.isDefault && (
                <button
                  onClick={() => {
                    const inUse = state.items.some(i => i.statusId === status.id)
                    if (inUse) {
                      dispatch({ type: 'SET_TOAST', toast: { message: 'Cannot delete — status is in use', type: 'error' } })
                      return
                    }
                    dispatch({ type: 'DELETE_STATUS', id: status.id })
                  }}
                  className="text-pm-muted hover:text-pm-danger text-[13px]"
                >
                  Delete
                </button>
              )}
              {status.isDefault && <span className="text-pm-dim text-[12px]">🔒</span>}
            </div>
          ))}
        </div>

        <form onSubmit={addStatus} className="bg-pm-surface rounded-lg border border-pm-border p-4">
          <p className="text-[13px] font-medium text-pm-muted mb-3">Add custom status</p>
          <div className="flex gap-2 mb-3">
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Status label"
              className="flex-1 text-[13px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1.5 outline-none focus:border-pm-accent"
            />
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex gap-1 mb-3 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[13px] text-pm-text-2">Scope:</span>
            {(['global', 'project'] as const).map(s => (
              <label key={s} className="flex items-center gap-1 text-[13px] text-pm-text-2 cursor-pointer">
                <input type="radio" value={s} checked={scope === s} onChange={() => setScope(s)} className="accent-[var(--pm-accent)]" />
                {s === 'global' ? 'Global (all projects)' : 'Current project'}
              </label>
            ))}
          </div>
          <button type="submit" className="bg-pm-accent text-pm-bg text-[13px] font-semibold px-3 py-1.5 rounded transition-colors hover:opacity-90">
            Add status
          </button>
        </form>
      </div>
    </div>
  )
}
