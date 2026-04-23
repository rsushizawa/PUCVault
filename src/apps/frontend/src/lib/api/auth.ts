import { apiFetch, setToken, clearToken } from "./client"

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
