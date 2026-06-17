import { useApp } from '../../context/AppContext'
import ItemHeader from '../items/ItemHeader'
import TabBar from '../detail/TabBar'
import SubTasksTab from '../detail/SubTasksTab'
import ConversationTab from '../detail/ConversationTab'
import LinksTab from '../detail/LinksTab'
import ActivityTab from '../detail/ActivityTab'
import EmptyState from '../ui/EmptyState'

export default function RightPanel() {
  const { state } = useApp()
  const { selectedItemId, activeTab } = state

  if (!selectedItemId) {
    return (
      <div className="flex-1 bg-zinc-900 flex items-center justify-center">
        <EmptyState icon="👆" title="Select an item" subtitle="Pick one from the middle panel" />
      </div>
    )
  }

  return (
    <div className="flex-1 bg-zinc-900 flex flex-col overflow-hidden">
      <ItemHeader />
      <TabBar />
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'subtasks'     && <SubTasksTab />}
        {activeTab === 'conversation' && <ConversationTab />}
        {activeTab === 'links'        && <LinksTab />}
        {activeTab === 'activity'     && <ActivityTab />}
      </div>
    </div>
  )
}
