import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function SubTasksTab() {
  const { state, dispatch } = useApp()
  const { selectedItemId } = state
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  if (!selectedItemId) return null

  const subTasks = state.subTasks
    .filter(st => st.itemId === selectedItemId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const pending = subTasks.filter(st => !st.done)
  const done = subTasks.filter(st => st.done)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    dispatch({ type: 'ADD_SUBTASK', itemId: selectedItemId!, title: title.trim() })
    setTitle('')
  }

  return (
    <div className="p-4">
      {pending.map(st => (
        <label key={st.id} className="flex items-center gap-2 mb-2 group cursor-pointer">
          <input
            type="checkbox"
            checked={false}
            onChange={() => dispatch({ type: 'TOGGLE_SUBTASK', id: st.id })}
            className="accent-teal-500 w-3.5 h-3.5"
          />
          <span className="text-xs text-zinc-300 flex-1">{st.title}</span>
          <button
            onClick={e => { e.preventDefault(); dispatch({ type: 'DELETE_SUBTASK', id: st.id }) }}
            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[10px]"
          >
            ✕
          </button>
        </label>
      ))}

      {done.length > 0 && (
        <>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-3 mb-2">Done</p>
          {done.map(st => (
            <label key={st.id} className="flex items-center gap-2 mb-2 group cursor-pointer opacity-50">
              <input
                type="checkbox"
                checked={true}
                onChange={() => dispatch({ type: 'TOGGLE_SUBTASK', id: st.id })}
                className="accent-teal-500 w-3.5 h-3.5"
              />
              <span className="text-xs text-zinc-500 line-through flex-1">{st.title}</span>
              <button
                onClick={e => { e.preventDefault(); dispatch({ type: 'DELETE_SUBTASK', id: st.id }) }}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[10px]"
              >
                ✕
              </button>
            </label>
          ))}
        </>
      )}

      <div className="mt-3">
        {adding ? (
          <form onSubmit={submit} className="flex gap-1">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Sub-task title"
              className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
            />
            <button type="submit" className="text-xs text-teal-400">Add</button>
            <button type="button" onClick={() => { setAdding(false); setTitle('') }} className="text-xs text-zinc-500">✕</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400">
            + Add sub-task
          </button>
        )}
      </div>
    </div>
  )
}
