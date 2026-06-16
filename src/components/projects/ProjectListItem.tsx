import { useApp } from '../../context/AppContext'
import type { Project } from '../../types'

interface Props { project: Project }

export default function ProjectListItem({ project }: Props) {
  const { state, dispatch } = useApp()
  const isSelected = state.selectedProjectId === project.id

  return (
    <button
      onClick={() => dispatch({ type: 'SELECT_PROJECT', id: project.id })}
      className={`w-full text-left px-3 py-2 rounded-r transition-colors border-l-2 ${
        isSelected
          ? 'border-teal-500 bg-zinc-700 text-white'
          : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'
      }`}
    >
      <p className="text-xs font-medium truncate">{project.name}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">
        {state.items.filter(i => i.projectId === project.id).length} items
      </p>
    </button>
  )
}
