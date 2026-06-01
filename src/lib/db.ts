import { supabase } from './supabase'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  profiles?: Profile
}

// ── Posts ──────────────────────────────────────────────

export async function fetchFeed(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) throw error
  return data as Post[]
}

export async function fetchPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Post
}

export async function fetchReplies(parentId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Post[]
}

export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Post[]
}

export async function createPost(content: string, parentId?: string): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data, error } = await supabase
    .from('posts')
    .insert({ content, user_id: user.id, parent_id: parentId ?? null })
    .select('*, profiles(*)')
    .single()
  if (error) throw error
  return data as Post
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

// ── Profiles ───────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

export async function updateProfile(updates: Partial<Omit<Profile, 'id' | 'created_at'>> & { id: string }): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', updates.id)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}
