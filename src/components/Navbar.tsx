import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../lib/db'
import type { Profile } from '../lib/db'

export default function Navbar() {
  const [userId, setUserId]   = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const path = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      setUserId(session.user.id)
      fetchProfile(session.user.id).then(p => { if (p) setProfile(p) }).catch(() => {})
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="navbar">
      <a href="/feed" className="nav-logo">lucuma</a>

      <div className="nav-links">
        <a href="/feed" className={`nav-link${path === '/feed' ? ' active' : ''}`}>
          Inicio
        </a>
        {userId && (
          <a
            href={`/profile?id=${userId}`}
            className={`nav-link${path === '/profile' ? ' active' : ''}`}
          >
            Mi perfil
          </a>
        )}
      </div>

      {profile && (
        <div className="nav-user">
          <div className="nav-user-info">
            <div className="avatar-sm">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.username} />
                : profile.username[0].toUpperCase()
              }
            </div>
            <span className="nav-username">@{profile.username}</span>
          </div>
          <button className="nav-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      )}
    </nav>
  )
}
