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
      className={`group w-full text-left px-3 py-2 rounded-r transition-colors border-l-2 ${
        isSelected
          ? 'border-teal-500 bg-zinc-700 text-white'
          : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <p className="text-xs font-medium truncate flex-1">{project.name}</p>
        <span
          role="button"
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-[11px] transition-opacity shrink-0"
          title="Delete project"
        >
          ✕
        </span>
      </div>
      <p className="text-[10px] text-zinc-500 mt-0.5">
        {state.items.filter(i => i.projectId === project.id).length} items
      </p>
    </button>
  )
}
