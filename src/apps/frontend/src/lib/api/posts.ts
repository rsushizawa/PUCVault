import { apiFetch } from "./client"
import type { Post, Comment } from "@/types/api"

const PAGE_SIZE = 20

type RawFeedRow = {
  id: number
  titulo: string
  conteudo: string
  nome_usuario: string
  img_perfil: string | null
  criado_em: string
  tags: Post["tags"]
  engajamento: number | string
  comentarios: number | string
  arquivo: string | null
  nome?: string
  forum_nome?: string
}

export async function getFeed(page = 1): Promise<{ posts: Post[]; total: number }> {
  const { rows } = await apiFetch<{ rows: RawFeedRow[] }>(`/feed/page/${page}`)
  const posts = rows.map((row) => ({
    id: String(row.id),
    title: row.titulo,
    body: row.conteudo,
    author: {
      id: String(row.id),
      username: row.nome_usuario,
      avatarUrl: row.img_perfil || undefined,
    },
    createdAt: row.criado_em,
    tags: (row.tags ?? [])
      .filter((t: any) => t?.id != null)
      .map((t: any) => ({ id: String(t.id), name: t.name ?? t.nome ?? t.tag ?? "" })),
    voteCount: Number(row.engajamento),
    commentCount: Number(row.comentarios),
    fileUrl: row.arquivo ?? undefined,
    forumSlug: row.nome ?? row.forum_nome ?? undefined,
  }))
  const total =
    rows.length === PAGE_SIZE
      ? page * PAGE_SIZE + 1
      : (page - 1) * PAGE_SIZE + rows.length
  return { posts, total }
}

export function getPost(id: string): Promise<Post & { comments: Comment[] }> {
  return apiFetch(`/posts/${id}`)
}

export function createPost(
  forumId: string,
  data: { title: string; content: string; tags: number[]; filename?: string },
): Promise<Post> {
  return apiFetch(`/posts/${forumId}/create`, {
    method: "POST",
    body: JSON.stringify({ ...data, filename: data.filename ?? null }),
  })
}

export function votePost(id: string, value: 1 | -1): Promise<void> {
  return apiFetch(`/posts/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}

export function createComment(
  postId: string,
  data: { content: string; parentId?: string },
): Promise<Comment> {
  return apiFetch(`/posts/${postId}/comments/create`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function voteComment(id: string, value: 1 | -1): Promise<void> {
  return apiFetch(`/comments/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}
