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
}

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

export function getCommunity(id: string): Promise<ForumSummary> {
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
