import { apiFetch } from "./client"
import { Cargo, CARGO_TO_ROLE_NUM } from "@/types/cargo"

export type UserInfo = {
  id: string
  username: string
  nome: string
  cargo: string
  img_perfil: string | null
}

export function getUserInfo(userId: string): Promise<{ info: UserInfo }> {
  return apiFetch(`/user/${userId}`)
}

export function getUserByUsername(username: string): Promise<{ info: UserInfo }> {
  return apiFetch(`/user/by-username/${encodeURIComponent(username)}`)
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
