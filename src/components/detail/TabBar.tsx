import { useApp } from '../../context/AppContext'
import type { TabId } from '../../types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'subtasks',     label: 'Sub-tasks' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'links',        label: 'Links' },
  { id: 'activity',     label: 'Activity' },
]

export default function TabBar() {
  const { state, dispatch } = useApp()
  return (
    <div className="flex border-b border-zinc-700 shrink-0">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: tab.id })}
          className={`px-3 py-2 text-[11px] border-b-2 transition-colors ${
            state.activeTab === tab.id
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
