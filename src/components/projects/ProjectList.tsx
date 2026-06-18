import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ProjectListItem from './ProjectListItem'

export default function ProjectList() {
  const { state, dispatch } = useApp()
  const { selectedBuId, projects } = state
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const filtered = selectedBuId
    ? projects.filter(p => p.businessUnitIds.includes(selectedBuId))
    : projects

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !selectedBuId) return
    dispatch({ type: 'ADD_PROJECT', name: name.trim(), description: '', businessUnitIds: [selectedBuId] })
    setName('')
    setAdding(false)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <p className="text-[11px] uppercase tracking-[0.1em] font-medium text-pm-muted px-3 pt-3 pb-1">Projects</p>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-[13px] text-pm-muted px-3 py-2">
            {selectedBuId ? 'No projects yet' : 'Select a unit first'}
          </p>
        ) : (
          filtered.map(p => <ProjectListItem key={p.id} project={p} />)
        )}
      </div>
      {selectedBuId && (
        <div className="px-3 pb-3 pt-2 border-t border-pm-border-subtle">
          {adding ? (
            <form onSubmit={submit} className="flex gap-1">
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Project name"
                className="flex-1 text-[13px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent"
              />
              <button type="submit" className="text-[12px] text-pm-accent px-1">Add</button>
              <button type="button" onClick={() => { setAdding(false); setName('') }} className="text-[12px] text-pm-muted px-1">✕</button>
            </form>
          ) : (
            <button onClick={() => setAdding(true)} className="text-[12px] text-pm-accent hover:text-pm-text-2">
              + New Project
            </button>
          )}
        </div>
      )}
    </div>
  )
}
