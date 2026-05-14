import { apiFetch, setToken, clearToken } from "./client"
import type { User } from "./types"

export type UserProfile = User

export async function getMe(): Promise<User> {
  return apiFetch<User>("/user/me")
}

export function updateMe(data: {
  username?: string
  name?: string
  email?: string
  password?: string
  avatarUrl?: string
}): Promise<void> {
  return apiFetch("/user/me", { method: "PATCH", body: JSON.stringify(data) })
}

export async function login(email: string, password: string): Promise<void> {
  const { token } = await apiFetch<{ user: unknown; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ userEmail: email, password }),
  })
  setToken(token)
}

export async function signIn(data: {
  name: string
  username: string
  email: string
  password: string
}): Promise<void> {
  await apiFetch("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function logout(): void {
  clearToken()
}
