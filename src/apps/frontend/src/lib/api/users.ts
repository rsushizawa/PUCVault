import { apiFetch } from "./client"
import { Cargo, CARGO_TO_ROLE_NUM } from "@/types/cargo"
import { mapPostRow, type RawPostRow } from "./utils"
import type { User, Post, Forum } from "./types"

export type UserInfo = User

export function getUserInfo(userId: string): Promise<User> {
  return apiFetch<User>(`/user/${userId}`)
}

export function getUserByUsername(username: string): Promise<User> {
  return apiFetch<User>(`/user/by-username/${encodeURIComponent(username)}`)
}

export function changeRole(userId: string, cargo: Cargo): Promise<void> {
  const roleNum = CARGO_TO_ROLE_NUM[cargo]
  return apiFetch(`/user/${userId}/change_role`, {
    method: "PATCH",
    body: JSON.stringify({ roleNum }),
  })
}

export function followUser(targetId: string): Promise<void> {
  return apiFetch(`/user/${targetId}/follow`, { method: "PATCH" })
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  const rows = await apiFetch<RawPostRow[]>(`/posts/user/${userId}`)
  return rows.map(mapPostRow)
}

export function getUserFollowedForums(userId: string): Promise<Forum[]> {
  return apiFetch<Forum[]>(`/user/${userId}/forums`)
}

export function checkForumFollow(userId: string, forumId: string): Promise<{ follows: boolean }> {
  return apiFetch<{ follows: boolean }>(`/user/${userId}/forum-follow/${forumId}`)
}

export function isFollowingUser(targetId: string): Promise<{ follows: boolean }> {
  return apiFetch<{ follows: boolean }>(`/user/${targetId}/is-following`)
}
