import { apiFetch, apiFormData } from "./client"
import type { Post, Comment } from "@/types/api"

const PAGE_SIZE = 20

function normalizeTags(raw: unknown[]): string[] {
  return raw
    .filter((t) => t != null)
    .map((t: any) => (typeof t === "string" ? t : (t.tag ?? t.name ?? t.nome ?? "")))
    .filter((s) => s !== "")
}

type RawFeedRow = {
  id: number
  titulo: string
  conteudo: string
  nome_usuario: string
  img_perfil: string | null
  criado_em: string
  tags: any[]
  engajamento: number | string
  comentarios: number | string
  arquivo: string | null
  nome?: string
  forum_nome?: string
  forum?: number
  criador?: number
  cargo?: string
  status?: string
}

export async function getFeed(page = 1): Promise<{ posts: Post[]; total: number }> {
  const { rows } = await apiFetch<{ rows: RawFeedRow[] }>(`/feed/page/${page}`)
  const posts: Post[] = rows.map((row) => ({
    id: row.id,
    titulo: row.titulo,
    arquivo: row.arquivo ?? null,
    forum: row.forum ?? 0,
    conteudo: row.conteudo,
    status: row.status ?? "",
    criado_em: row.criado_em,
    criador: row.criador ?? 0,
    nome_usuario: row.nome_usuario,
    cargo: row.cargo ?? "",
    img_perfil: row.img_perfil ?? null,
    tags: normalizeTags(row.tags ?? []),
    engajamento: String(row.engajamento),
    comentarios: String(row.comentarios),
    nome: row.nome ?? row.forum_nome,
    forum_nome: row.forum_nome,
  }))
  const total =
    rows.length === PAGE_SIZE
      ? page * PAGE_SIZE + 1
      : (page - 1) * PAGE_SIZE + rows.length
  return { posts, total }
}

export function getPost(id: string): Promise<Post> {
  return apiFetch(`/posts/${id}`)
}

export function createPost(
  forumId: string,
  data: { title: string; content: string; tags: number[]; files?: File[] },
): Promise<{ message: string; file_id?: string }> {
  const form = new FormData()
  form.append("title", data.title)
  form.append("content", data.content)
  for (const tagId of data.tags) {
    form.append("tags", String(tagId))
  }
  for (const file of data.files ?? []) {
    form.append("file", file)
  }
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
  const data = await apiFetch<{ rows: RawCommentRow[] }>(`/posts/${postId}/comments`)
  return buildCommentTree(data.rows, postId)
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
