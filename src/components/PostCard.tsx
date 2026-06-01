import type { Post } from '../lib/db'

interface Props {
  post: Post
  currentUserId?: string
  onDelete?: (id: string) => void
  showReplyLink?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  if (mins < 1)  return 'ahora'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7)  return `${days}d`
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function PostCard({ post, currentUserId, onDelete, showReplyLink = true }: Props) {
  const profile  = post.profiles
  const isOwner  = currentUserId === post.user_id
  const initials = (profile?.username ?? '?')[0].toUpperCase()

  return (
    <article className="post-card">
      <div className="post-avatar">
        <a href={`/profile?id=${post.user_id}`}>
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt={profile.username} className="avatar-img" />
            : <div className="avatar-placeholder">{initials}</div>
          }
        </a>
      </div>

      <div className="post-body">
        <div className="post-header">
          <a href={`/profile?id=${post.user_id}`} className="post-username">
            @{profile?.username ?? 'usuario'}
          </a>
          <span className="post-time">{timeAgo(post.created_at)}</span>
          {isOwner && onDelete && (
            <button
              className="post-delete"
              onClick={() => onDelete(post.id)}
              title="Eliminar"
            >
              ✕
            </button>
          )}
        </div>

        <p className="post-content">{post.content}</p>

        {showReplyLink && (
          <a href={`/post?id=${post.id}`} className="post-reply-btn">
            Responder
          </a>
        )}
      </div>
    </article>
  )
}
