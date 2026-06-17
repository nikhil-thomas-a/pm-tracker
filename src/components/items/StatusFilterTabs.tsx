import { useApp } from '../../context/AppContext'

interface Props {
  activeStatusId: string | 'all'
  onChange: (id: string | 'all') => void
}

export default function StatusFilterTabs({ activeStatusId, onChange }: Props) {
  const { state } = useApp()
  const projectId = state.selectedProjectId
  const statuses = state.statuses.filter(
    s => s.scope === 'global' || s.projectId === projectId
  ).sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-wrap gap-1 px-3 py-2">
      {[{ id: 'all', label: 'All' }, ...statuses].map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
            activeStatusId === s.id
              ? 'bg-teal-500 text-white border-teal-500'
              : 'border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
