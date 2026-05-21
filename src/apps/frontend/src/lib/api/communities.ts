import { apiFetch, apiFetchPaginated } from "./client"
import type { Post, Forum } from "./types"
import { mapPostRow, type RawPostRow } from "./utils"

export type { Forum } from "./types"
export type ForumSummary = Forum

export type FileTag   = { id: number; name: string; count: number }
export type FileEntry = { post_id: number; title: string; file_url: string; uploaded_at: string }

export type ForumFollower = {
  id: number
  nome: string
  nome_usuario: string
  cargo?: string
  img_perfil?: string | null
}

export function getForumByName(name: string): Promise<ForumSummary> {
  return apiFetch(`/forums/by-name/${encodeURIComponent(name)}`)
}

export function getForums(): Promise<ForumSummary[]> {
  return apiFetch<ForumSummary[]>("/forums/print/forums")
}

export function getFollowedForums(userId: string): Promise<ForumSummary[]> {
  return apiFetch(`/user/${userId}/forums`)
}

export async function getCommunity(id: string): Promise<ForumSummary> {
  const raw = await apiFetch<Record<string, unknown>>(`/forums/${id}`)
  // The endpoint returns forum props mixed with indexed follower objects keyed 0,1,2…
  const named = Object.fromEntries(
    Object.entries(raw).filter(([k]) => !/^\d+$/.test(k)),
  )
  return named as unknown as ForumSummary
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

export async function getCommunityPosts(
  id: string,
  page = 1,
): Promise<{ posts: Post[]; total: number }> {
  const { data, total } = await apiFetchPaginated<RawPostRow>(`/posts/${id}/page/${page}`)
  return { posts: data.map(mapPostRow), total }
}

export async function getFileYears(forumId: string): Promise<number[]> {
  return (await apiFetch<number[]>(`/forums/${forumId}/files/year`)) ?? []
}

export async function getFileTagsByYear(forumId: string, year: number): Promise<FileTag[]> {
  return (await apiFetch<FileTag[]>(`/forums/${forumId}/files/year/${year}`)) ?? []
}

export async function getFilesByYearAndTag(forumId: string, year: number, tagName: string): Promise<FileEntry[]> {
  return (await apiFetch<FileEntry[]>(`/forums/${forumId}/files/year/${year}/tag/${encodeURIComponent(tagName)}`)) ?? []
}
