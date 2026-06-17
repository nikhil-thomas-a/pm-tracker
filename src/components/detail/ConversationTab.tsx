import { useApp } from '../../context/AppContext'
import ConversationBubble from './ConversationBubble'
import ConversationCompose from './ConversationCompose'
import EmptyState from '../ui/EmptyState'
import { useEffect, useRef } from 'react'

export default function ConversationTab() {
  const { state } = useApp()
  const { selectedItemId, conversationEntries } = state
  const bottomRef = useRef<HTMLDivElement>(null)

  const entries = selectedItemId
    ? conversationEntries
        .filter(e => e.itemId === selectedItemId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  if (!selectedItemId) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {entries.length === 0 ? (
          <EmptyState icon="💬" title="No entries yet" subtitle="Add a note below" />
        ) : (
          entries.map(e => <ConversationBubble key={e.id} entry={e} />)
        )}
        <div ref={bottomRef} />
      </div>
      <ConversationCompose itemId={selectedItemId} />
    </div>
  )
}
