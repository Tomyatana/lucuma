import { useState } from 'react'
import { updateProfile } from '../lib/db'
import type { Profile } from '../lib/db'

interface Props {
  profile: Profile
  onSaved: (updated: Profile) => void
  onClose: () => void
}

export default function EditProfileModal({ profile, onSaved, onClose }: Props) {
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio]           = useState(profile.bio ?? '')
  const [avatarUrl, setAvatar]  = useState(profile.avatar_url ?? '')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim().length < 3) { setError('El usuario debe tener al menos 3 caracteres'); return }
    setLoading(true)
    setError(null)
    try {
      const updated = await updateProfile({
        id: profile.id,
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      onSaved(updated)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar'
      setError(msg.includes('duplicate') ? 'Ese nombre de usuario ya está en uso' : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Editar perfil</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="modal-label">Nombre de usuario</label>
          <input
            className="auth-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={30}
            required
          />

          <label className="modal-label">Bio</label>
          <textarea
            className="composer-input"
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Contá algo sobre vos..."
          />

          <label className="modal-label">URL del avatar</label>
          <input
            className="auth-input"
            type="url"
            value={avatarUrl}
            onChange={e => setAvatar(e.target.value)}
            placeholder="https://..."
          />

          {error && <p className="auth-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="auth-btn" disabled={loading} style={{ margin: 0, width: 'auto', padding: '10px 22px' }}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
