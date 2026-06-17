import DOMPurify from 'dompurify'
import { formatDateTime } from '../../utils/date'
import type { ConversationEntry } from '../../types'

interface Props { entry: ConversationEntry }

export default function ConversationBubble({ entry }: Props) {
  const safeHtml = DOMPurify.sanitize(entry.content, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })

  return (
    <div className="mb-4">
      <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">
        {formatDateTime(entry.createdAt)}
      </p>
      <div
        className="bg-zinc-800 border border-zinc-700 rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl px-3 py-2 text-xs text-zinc-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  )
}
