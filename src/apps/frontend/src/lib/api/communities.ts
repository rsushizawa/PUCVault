import { apiFetch } from "./client"
import type { Community, Post } from "@/types/api"

export type FileTag   = { id: number; name: string; count: number }
export type FileEntry = { post_id: number; title: string; file_url: string; uploaded_at: string }

export type ForumSummary = {
  id: number
  nome: string
  descricao: string
  status: string
  criado_em: string
  excluido_em: string | null
  criador: number
  validador: number | null
  identidade_visual: number
}

export function getForumByName(name: string): Promise<ForumSummary> {
  return apiFetch(`/forums/by-name/${encodeURIComponent(name)}`)
}

export function getForums(): Promise<ForumSummary[]> {
  return apiFetch("/forums/print/forums")
}

export function getFollowedForums(): Promise<ForumSummary[]> {
  return apiFetch("/forums/following")
}

// Backend uses /forums — maps to "community" in the frontend
export function getCommunity(id: string): Promise<Community> {
  return apiFetch(`/forums/${id}`)
}

const PAGE_SIZE = 20

type RawPostRow = {
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
}

function mapPostRow(row: RawPostRow): Post {
  return {
    id: String(row.id),
    title: row.titulo,
    body: row.conteudo,
    author: {
      id: String(row.id),
      username: row.nome_usuario,
      avatarUrl: row.img_perfil || undefined,
    },
    createdAt: row.criado_em,
    tags: row.tags ?? [],
    voteCount: Number(row.engajamento),
    commentCount: Number(row.comentarios),
    fileUrl: row.arquivo ?? undefined,
  }
}

export async function getCommunityPosts(
  id: string,
  page = 1,
): Promise<{ posts: Post[]; total: number }> {
  const { rows } = await apiFetch<{ rows: RawPostRow[] }>(`/posts/${id}/page/${page}`)
  const posts = rows.map(mapPostRow)
  const total =
    rows.length === PAGE_SIZE
      ? page * PAGE_SIZE + 1
      : (page - 1) * PAGE_SIZE + rows.length
  return { posts, total }
}

export function getFileYears(forumId: string): Promise<number[]> {
  return apiFetch(`/forums/${forumId}/files/years`)
}

export function getFileTagsByYear(forumId: string, year: number): Promise<FileTag[]> {
  return apiFetch(`/forums/${forumId}/files/years/${year}/tags`)
}

export function getFilesByYearAndTag(forumId: string, year: number, tagId: number): Promise<FileEntry[]> {
  return apiFetch(`/forums/${forumId}/files/years/${year}/tags/${tagId}`)
}

export function followCommunity(id: string): Promise<void> {
  return apiFetch(`/forums/${id}/follow`, { method: "PATCH" })
}
