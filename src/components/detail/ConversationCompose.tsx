import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useApp } from '../../context/AppContext'

interface Props { itemId: string }

export default function ConversationCompose({ itemId }: Props) {
  const { dispatch } = useApp()

  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    editorProps: {
      attributes: { class: 'tiptap min-h-[60px] px-2 py-1' },
    },
  })

  function submit() {
    if (!editor || editor.isEmpty) return
    dispatch({ type: 'ADD_CONVERSATION_ENTRY', itemId, content: editor.getHTML() })
    editor.commands.clearContent()
  }

  return (
    <div className="border-t border-pm-border p-3">
      <div className="flex gap-1 mb-2">
        {[
          { label: 'B', action: () => editor?.chain().focus().toggleBold().run() },
          { label: 'I', action: () => editor?.chain().focus().toggleItalic().run() },
          { label: 'U', action: () => editor?.chain().focus().toggleUnderline().run() },
          { label: '•', action: () => editor?.chain().focus().toggleBulletList().run() },
        ].map(({ label, action }) => (
          <button key={label} onClick={action} className="text-[13px] text-pm-muted hover:text-pm-text border border-pm-border rounded px-1.5 py-0.5 transition-colors">
            {label}
          </button>
        ))}
      </div>
      <div className="bg-pm-surface-up border border-pm-border rounded-lg overflow-hidden mb-2">
        <EditorContent editor={editor} />
      </div>
      <div className="flex justify-end">
        <button
          onClick={submit}
          className="bg-pm-accent hover:opacity-90 text-pm-bg text-[13px] font-semibold px-3 py-1.5 rounded transition-opacity"
        >
          Add entry
        </button>
      </div>
    </div>
  )
}
