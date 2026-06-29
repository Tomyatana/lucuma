import type { Post } from '../lib/db'
import { timeAgo } from '../lib/format'

interface Props {
  post: Post
  currentUserId?: string
  onDelete?: (id: string) => void
  showReplyLink?: boolean
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
