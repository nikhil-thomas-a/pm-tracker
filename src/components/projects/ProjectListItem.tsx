import { useApp } from '../../context/AppContext'
import type { Project } from '../../types'

interface Props { project: Project }

export default function ProjectListItem({ project }: Props) {
  const { state, dispatch } = useApp()
  const isSelected = state.selectedProjectId === project.id

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    const itemCount = state.items.filter(i => i.projectId === project.id).length
    const msg = itemCount > 0
      ? `Delete "${project.name}" and its ${itemCount} item(s)?`
      : `Delete "${project.name}"?`
    if (confirm(msg)) {
      dispatch({ type: 'DELETE_PROJECT', id: project.id })
    }
  }

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_PROJECT', id: project.id })}
      className={`group w-full text-left px-3 py-1.5 transition-colors border-l-2 ${
        isSelected
          ? 'border-pm-accent bg-pm-surface-up text-pm-text'
          : 'border-transparent text-pm-text-2 hover:text-pm-text hover:bg-pm-surface-up'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-[11px] font-medium truncate flex-1" style={{ letterSpacing: '-0.01em' }}>{project.name}</p>
        <span
          role="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-pm-muted hover:text-pm-danger text-[10px] transition-opacity shrink-0"
          title="Delete project"
        >
          ✕
        </span>
      </div>
      <p className="text-[9px] text-pm-muted mt-0.5">
        {state.items.filter(i => i.projectId === project.id).length} items
      </p>
    </button>
  )
}
