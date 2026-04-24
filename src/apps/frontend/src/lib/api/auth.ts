import { apiFetch, setToken, clearToken } from "./client"

export type UserProfile = {
  id: string
  username: string
  name: string
  email: string
  avatarUrl: string | null
}

export function getMe(): Promise<UserProfile> {
  return apiFetch("/user/me")
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
  const { token } = await apiFetch<{ token: string }>("/auth/login", {
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
