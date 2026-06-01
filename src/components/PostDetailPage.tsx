import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { fetchPost, fetchReplies, deletePost } from '../lib/db'
import type { Post } from '../lib/db'
import Navbar from './Navbar'
import PostCard from './PostCard'
import PostComposer from './PostComposer'

export default function PostDetailPage() {
  const id = useMemo(() => new URLSearchParams(window.location.search).get('id') ?? '', [])

  const [post, setPost]       = useState<Post | null>(null)
  const [replies, setReplies] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/'; return }
      setUserId(session.user.id)
    })
    if (!id) { setNotFound(true); setLoading(false); return }
    load()
  }, [id])

  async function load() {
    try {
      const [p, r] = await Promise.all([fetchPost(id), fetchReplies(id)])
      if (!p) { setNotFound(true); return }
      setPost(p)
      setReplies(r)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(postId: string) {
    await deletePost(postId)
    if (postId === id) {
      window.location.href = '/feed'
    } else {
      setReplies(prev => prev.filter(r => r.id !== postId))
    }
  }

  function handleNewReply(reply: Post) {
    setReplies(prev => [...prev, reply])
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="feed-main">
        <div className="feed-header">
          <a href="/feed" className="back-btn">← Volver</a>
          <h2 className="feed-title">Post</h2>
        </div>

        {loading && <p className="loading">Cargando...</p>}
        {notFound && <p className="empty">Post no encontrado.</p>}

        {!loading && !notFound && post && (
          <>
            <PostCard
              post={post}
              currentUserId={userId ?? undefined}
              onDelete={handleDelete}
              showReplyLink={false}
            />

            <div className="replies-section">
              <PostComposer
                parentId={id}
                placeholder="Escribí tu respuesta..."
                onPost={handleNewReply}
              />
              {replies.length === 0 ? (
                <p className="empty">Todavía no hay respuestas.</p>
              ) : (
                replies.map(reply => (
                  <PostCard
                    key={reply.id}
                    post={reply}
                    currentUserId={userId ?? undefined}
                    onDelete={handleDelete}
                    showReplyLink={false}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
