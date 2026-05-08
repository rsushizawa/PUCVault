import { apiFetch, setToken, clearToken } from "./client"

export type UserProfile = {
  id: number
  nome: string
  nome_usuario: string
  descricao: string | null
  status: string
  criado_em: string
  identidade_visual: number
  img_perfil: string | null
  img_banner: string | null
  seguidores: string
  segue: string
  karma: string
  cargo?: string
}

export async function getMe(): Promise<UserProfile> {
  const { info } = await apiFetch<{ info: UserProfile }>("/user/me")
  return info
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
