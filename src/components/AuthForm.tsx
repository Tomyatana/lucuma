import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthForm() {
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = '/feed'
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        if (username.trim().length < 3) throw new Error('El usuario debe tener al menos 3 caracteres')
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() } },
        })
        if (error) throw error
      }
      window.location.href = '/feed'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">lucuma</div>
        <h1 className="auth-title">
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
        </h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <input
              className="auth-input"
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>
        <p className="auth-toggle">
          {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button
            className="auth-toggle-btn"
            type="button"
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(null) }}
          >
            {mode === 'login' ? 'Registrate' : 'Iniciá sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
