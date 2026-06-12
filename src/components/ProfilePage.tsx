import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { fetchProfile, fetchUserPosts, deletePost } from '../lib/db'
import type { Post, Profile } from '../lib/db'
import Navbar from './Navbar'
import PostCard from './PostCard'
import EditProfileModal from './EditProfileModal'

export default function ProfilePage() {
  const id = useMemo(() => new URLSearchParams(window.location.search).get('id') ?? '', [])

  const [profile, setProfile]       = useState<Profile | null>(null)
  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editing, setEditing]       = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/'; return }
      setCurrentUserId(session.user.id)
    })
    if (!id) { setLoading(false); return }
    load()
  }, [id])

  async function load() {
    try {
      const [prof, userPosts] = await Promise.all([fetchProfile(id), fetchUserPosts(id)])
      setProfile(prof)
      setPosts(userPosts)
    } catch {
      // sin perfil
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(postId: string) {
    await deletePost(postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const initials = (profile?.username ?? '?')[0].toUpperCase()

  return (
    <div className="app-layout">
      <Navbar />
      <main className="feed-main">
        <div className="feed-header">
          <a href="/feed" className="back-btn">← Volver</a>
          <h2 className="feed-title">Perfil</h2>
        </div>

        {loading ? (
          <p className="loading">Cargando...</p>
        ) : (
          <>
            <div className="profile-header">
              <div className="profile-avatar-lg">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.username} />
                  : <div className="avatar-placeholder-lg">{initials}</div>
                }
              </div>
              <div className="profile-info">
                <h1 className="profile-username">@{profile?.username ?? 'usuario'}</h1>
                {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
                <p className="profile-stats">{posts.length} publicación{posts.length !== 1 ? 'es' : ''}</p>
              </div>
              {profile && currentUserId === id && (
                <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                  Editar perfil
                </button>
              )}
            </div>

            {posts.length === 0 ? (
              <p className="empty">Este usuario no publicó nada todavía.</p>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId ?? undefined}
                  onDelete={handleDelete}
                />
              ))
            )}
          </>
        )}
      </main>

      {editing && profile && (
        <EditProfileModal
          profile={profile}
          onSaved={setProfile}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
