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
          className={
            activeStatusId === s.id
              ? 'bg-pm-accent text-pm-bg text-[11px] font-semibold px-2 py-0.5 rounded-full'
              : 'border border-pm-border text-pm-muted text-[11px] px-2 py-0.5 rounded-full hover:text-pm-text-2 transition-colors'
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
