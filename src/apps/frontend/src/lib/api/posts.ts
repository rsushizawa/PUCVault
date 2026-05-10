import { apiFetch, apiFormData } from "./client"
import type { Post, Comment } from "./types"
import { mapPostRow, calcTotal, type RawPostRow } from "./utils"

export async function getFeed(page = 1): Promise<{ posts: Post[]; total: number }> {
  const rows = await apiFetch<RawPostRow[]>(`/feed/page/${page}`)
  return { posts: rows.map(mapPostRow), total: calcTotal(rows, page) }
}

export function getPost(id: string): Promise<Post> {
  return apiFetch(`/posts/${id}`)
}

export function createPost(
  forumId: string,
  data: { title: string; content: string; tags: number[]; file?: File },
): Promise<{ message: string; file_id?: string }> {
  const form = new FormData()
  form.append("title", data.title)
  form.append("content", data.content)
  for (const tagId of data.tags) {
    form.append("tags", String(tagId))
  }
  if (data.file) form.append("file", data.file)
  return apiFormData(`/posts/${forumId}/create`, form, "POST")
}

export function votePost(id: string, value: 1 | -1): Promise<void> {
  return apiFetch(`/posts/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}

type RawCommentRow = {
  conteudo_id: number
  conteudo_pai: number
  nivel: number
  conteudo: string
  criado_em: string
  nome_usuario: string
  img_perfil: string | null
  engajamento: string
}

function buildCommentTree(rows: RawCommentRow[], postId: string): Comment[] {
  const map = new Map<string, Comment>()
  for (const row of rows) {
    map.set(String(row.conteudo_id), {
      id: String(row.conteudo_id),
      body: row.conteudo,
      author: { id: "", username: row.nome_usuario, avatarUrl: row.img_perfil ?? undefined },
      createdAt: row.criado_em,
      voteCount: Number(row.engajamento),
      level: row.nivel,
      children: [],
    })
  }
  const roots: Comment[] = []
  for (const row of rows) {
    const comment = map.get(String(row.conteudo_id))!
    if (row.nivel === 1 || String(row.conteudo_pai) === postId) {
      roots.push(comment)
    } else {
      const parent = map.get(String(row.conteudo_pai))
      if (parent) parent.children.push(comment)
      else roots.push(comment)
    }
  }
  return roots
}

export async function getComments(postId: string): Promise<Comment[]> {
  const rows = await apiFetch<RawCommentRow[]>(`/posts/${postId}/comments`)
  return buildCommentTree(rows, postId)
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
