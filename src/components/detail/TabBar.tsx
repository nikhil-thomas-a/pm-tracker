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
    <div className="flex border-b border-pm-border-subtle px-1 pt-1 shrink-0 bg-pm-surface">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: tab.id })}
          className={
            state.activeTab === tab.id
              ? 'text-pm-accent text-[12px] uppercase tracking-[0.1em] font-medium border-b-2 border-pm-accent pb-2 px-3 transition-colors'
              : 'text-pm-muted text-[12px] uppercase tracking-[0.1em] font-medium border-b-2 border-transparent pb-2 px-3 hover:text-pm-text-2 transition-colors'
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
