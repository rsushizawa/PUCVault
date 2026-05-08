import { apiFetch } from "./client"
import type { Post } from "@/types/api"

export type FileTag   = { id: number; name: string; count: number }
export type FileEntry = { post_id: number; title: string; file_url: string; uploaded_at: string }

export type ForumSummary = {
  id: number
  nome: string
  descricao: string
  status: string
  criado_em: string
  excluido_em: string | null
  status_modificado_em: string | null
  criador: number
  validador: number | null
  identidade_visual: number
  seguidores?: string
  nome_usuario?: string
  img_perfil?: string | null
  img_banner?: string | null
  user_status?: string
}

export type ForumFollower = { id: number; username: string; nome: string }

export function getForumByName(name: string): Promise<ForumSummary> {
  return apiFetch(`/forums/by-name/${encodeURIComponent(name)}`)
}

export async function getForums(): Promise<ForumSummary[]> {
  const { rows } = await apiFetch<{ rows: ForumSummary[] }>("/forums/print/forums")
  return rows
}

export function getFollowedForums(): Promise<ForumSummary[]> {
  return apiFetch("/forums/following")
}

export async function getCommunity(id: string): Promise<ForumSummary> {
  const raw = await apiFetch<Record<string, unknown>>(`/forums/${id}`)
  // The endpoint returns forum props mixed with indexed follower objects — extract only named fields
  return raw as unknown as ForumSummary
}

export function updateForumDescription(id: string, descricao: string): Promise<void> {
  return apiFetch(`/forums/${id}/update`, {
    method: "PATCH",
    body: JSON.stringify({ descricao }),
  })
}

export function validateForum(id: string): Promise<void> {
  return apiFetch(`/forums/${id}/validate`, { method: "PATCH" })
}

export function createForum(nome: string, descricao: string): Promise<ForumSummary> {
  return apiFetch("/forums/create", {
    method: "POST",
    body: JSON.stringify({ nome, descricao }),
  })
}

export function getForumFollowers(id: string): Promise<ForumFollower[]> {
  return apiFetch(`/forums/${id}/list`)
}

export function followCommunity(id: string): Promise<void> {
  return apiFetch(`/forums/${id}/follow`, { method: "POST" })
}

const PAGE_SIZE = 20

type RawPostRow = {
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
  forum?: number
  criador?: number
  cargo?: string
  status?: string
}

function mapPostRow(row: RawPostRow): Post {
  return {
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
    tags: (row.tags ?? [])
      .filter((t: any) => t != null)
      .map((t: any) => (typeof t === "string" ? t : (t.tag ?? t.name ?? t.nome ?? "")))
      .filter((s: string) => s !== ""),
    engajamento: String(row.engajamento),
    comentarios: String(row.comentarios),
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

export async function getFileYears(forumId: string): Promise<number[]> {
  const { rows } = await apiFetch<{ rows: number[] }>(`/forums/${forumId}/files/year`)
  return rows ?? []
}

export async function getFileTagsByYear(forumId: string, year: number): Promise<FileTag[]> {
  const { rows } = await apiFetch<{ rows: FileTag[] }>(`/forums/${forumId}/files/year/${year}`)
  return rows ?? []
}

export async function getFilesByYearAndTag(forumId: string, year: number, tagName: string): Promise<FileEntry[]> {
  const { results } = await apiFetch<{ results: FileEntry[] }>(
    `/forums/${forumId}/files/year/${year}/tag/${encodeURIComponent(tagName)}`
  )
  return results ?? []
}
