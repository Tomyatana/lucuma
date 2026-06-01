import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fetchFeed, deletePost } from '../lib/db'
import type { Post } from '../lib/db'
import Navbar from './Navbar'
import PostCard from './PostCard'
import PostComposer from './PostComposer'

export default function FeedPage() {
  const [posts, setPosts]   = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/'; return }
      setUserId(session.user.id)
      load()
    })
  }, [])

  async function load() {
    try {
      const data = await fetchFeed()
      setPosts(data)
    } catch {
      // feed vacío
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await deletePost(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  function handleNewPost(post: Post) {
    setPosts(prev => [post, ...prev])
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="feed-main">
        <div className="feed-header">
          <h2 className="feed-title">Inicio</h2>
        </div>

        <PostComposer onPost={handleNewPost} />

        {loading ? (
          <p className="loading">Cargando...</p>
        ) : posts.length === 0 ? (
          <p className="empty">Nadie publicó nada todavía. ¡Sé el primero!</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={userId ?? undefined}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>
    </div>
  )
}
