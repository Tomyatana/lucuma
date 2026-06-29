// Formateo de tiempo relativo para mostrar la antigüedad de un post.
// Devuelve "ahora", "Xm", "Xh", "Xd" o una fecha corta (es-AR) si pasó más de una semana.
// `now` es inyectable para poder testear sin depender del reloj real.
export function timeAgo(dateStr: string, now: number = Date.now()): string {
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)

  if (mins < 1)  return 'ahora'
  if (mins < 60) return `${mins}m`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
