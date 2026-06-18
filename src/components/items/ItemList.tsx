import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import ItemCard from './ItemCard'
import StatusFilterTabs from './StatusFilterTabs'
import EmptyState from '../ui/EmptyState'

export default function ItemList() {
  const { state, dispatch } = useApp()
  const { selectedProjectId, items } = state
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all')
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { setFilterStatus('all') }, [selectedProjectId])
  useEffect(() => { setSearch('') }, [selectedProjectId])

  const project = state.projects.find(p => p.id === selectedProjectId)
  const projectItems = items
    .filter(i => i.projectId === selectedProjectId)
    .filter(i => filterStatus === 'all' || i.statusId === filterStatus)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aIsDone = a.statusId === 'done' ? 1 : 0
      const bIsDone = b.statusId === 'done' ? 1 : 0
      return aIsDone - bIsDone || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !selectedProjectId) return
    dispatch({ type: 'ADD_ITEM', projectId: selectedProjectId, title: title.trim() })
    setTitle('')
    setAdding(false)
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon="📋" title="Select a project" subtitle="Choose from the left panel" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-2 border-b border-pm-border-subtle">
        <p className="text-[13px] font-semibold text-pm-text truncate">{project.name}</p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items…"
          className="mt-1.5 w-full text-[12px] bg-transparent text-pm-text-2 placeholder-pm-muted outline-none border-b border-transparent focus:border-pm-border transition-colors pb-0.5"
        />
      </div>
      <StatusFilterTabs activeStatusId={filterStatus} onChange={setFilterStatus} />
      <div className="flex-1 overflow-y-auto px-1">
        {projectItems.length === 0 ? (
          <EmptyState icon="✨" title="No items" subtitle="Add one below" />
        ) : (
          projectItems.map(item => <ItemCard key={item.id} item={item} />)
        )}
      </div>
      <div className="px-3 py-2 border-t border-pm-border-subtle">
        {adding ? (
          <form onSubmit={submit} className="flex gap-1">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Item title"
              className="flex-1 text-[12px] bg-pm-surface-up text-pm-text border border-pm-border rounded px-2 py-1 outline-none focus:border-pm-accent"
            />
            <button type="submit" className="text-[12px] text-pm-accent">Add</button>
            <button type="button" onClick={() => { setAdding(false); setTitle('') }} className="text-[12px] text-pm-muted">✕</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="text-[12px] text-pm-accent hover:text-pm-text-2">
            + New Item
          </button>
        )}
      </div>
    </div>
  )
}
