import { apiFetch } from "./client"
import type { Community, Post } from "@/types/api"
import type { Semester, SortOption } from "@/lib/file-grouping"

// Backend uses /forums — maps to "community" in the frontend
export function getCommunity(id: string): Promise<Community> {
  return apiFetch(`/forums/${id}`)
}

export function getCommunityPosts(
  id: string,
  page = 1,
): Promise<{ posts: Post[]; total: number }> {
  return apiFetch(`/posts/${id}/page/${page}`)
}

export function getCommunityFiles(id: string, sort: SortOption): Promise<Semester[]> {
  return apiFetch(`/forums/${id}/files?sort=${sort}`)
}

export function followCommunity(id: string): Promise<void> {
  return apiFetch(`/forums/${id}/follow`, { method: "PATCH" })
}
