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
      <div className="px-3 pt-3 pb-2 border-b border-zinc-700">
        <p className="text-xs font-semibold text-zinc-200 truncate">{project.name}</p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items…"
          className="mt-2 w-full text-[11px] bg-transparent text-zinc-300 placeholder-zinc-600 outline-none border-b border-transparent focus:border-zinc-600 transition-colors pb-1"
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
      <div className="px-3 py-2 border-t border-zinc-700">
        {adding ? (
          <form onSubmit={submit} className="flex gap-1">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Item title"
              className="flex-1 text-xs bg-zinc-700 text-zinc-100 border border-zinc-600 rounded px-2 py-1 outline-none focus:border-teal-500"
            />
            <button type="submit" className="text-xs text-teal-400">Add</button>
            <button type="button" onClick={() => { setAdding(false); setTitle('') }} className="text-xs text-zinc-500">✕</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="text-[11px] text-teal-500 hover:text-teal-400">
            + New Item
          </button>
        )}
      </div>
    </div>
  )
}
