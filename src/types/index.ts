export interface BusinessUnit {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface DocLink {
  id: string
  label: string
  url: string
}

export interface Project {
  id: string
  name: string
  description: string
  businessUnitIds: string[]
  docs: DocLink[]
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  projectId: string
  title: string
  description: string
  statusId: string
  deadline: string | null
  links: DocLink[]
  createdAt: string
  updatedAt: string
}

export interface SubTask {
  id: string
  itemId: string
  title: string
  done: boolean
  createdAt: string
}

export interface ConversationEntry {
  id: string
  itemId: string
  content: string
  createdAt: string
}

export type ActivityType =
  | 'item_created'
  | 'status_changed'
  | 'subtask_checked'
  | 'subtask_unchecked'
  | 'deadline_set'
  | 'deadline_cleared'
  | 'link_added'
  | 'link_removed'
  | 'note_added'

export interface ActivityEntry {
  id: string
  itemId: string
  type: ActivityType
  description: string
  createdAt: string
}

export interface Status {
  id: string
  label: string
  color: string
  scope: 'global' | 'project'
  projectId?: string
  isDefault: boolean
  order: number
}

export interface AppData {
  businessUnits: BusinessUnit[]
  projects: Project[]
  items: Item[]
  subTasks: SubTask[]
  conversationEntries: ConversationEntry[]
  activityEntries: ActivityEntry[]
  statuses: Status[]
}

export type TabId = 'subtasks' | 'conversation' | 'links' | 'activity'

export interface AppState extends AppData {
  selectedBuId: string | null
  selectedProjectId: string | null
  selectedItemId: string | null
  activeTab: TabId
  showSettings: boolean
  toast: { message: string; type: 'success' | 'error' } | null
}
