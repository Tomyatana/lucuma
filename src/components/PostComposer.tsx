import { useState } from 'react'
import { createPost } from '../lib/db'
import type { Post } from '../lib/db'

const MAX = 280

interface Props {
  parentId?:   string
  placeholder?: string
  onPost?:     (post: Post) => void
}

export default function PostComposer({ parentId, placeholder = '¿Qué estás pensando?', onPost }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const post = await createPost(content.trim(), parentId)
      setContent('')
      onPost?.(post)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar')
    } finally {
      setLoading(false)
    }
  }

  const remaining = MAX - content.length

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        className="composer-input"
        placeholder={placeholder}
        value={content}
        onChange={e => setContent(e.target.value)}
        maxLength={MAX}
        rows={3}
      />
      <div className="composer-footer">
        {error && <span className="composer-error">{error}</span>}
        <span className={`composer-count${remaining <= 20 ? ' warn' : ''}`}>
          {remaining}
        </span>
        <button
          className="composer-btn"
          type="submit"
          disabled={loading || !content.trim()}
        >
          {parentId ? 'Responder' : 'Publicar'}
        </button>
      </div>
    </form>
  )
}
