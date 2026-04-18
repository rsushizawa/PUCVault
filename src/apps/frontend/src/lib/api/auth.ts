import { apiFetch, setToken, clearToken } from "./client"

export async function login(email: string, password: string): Promise<void> {
  const { token } = await apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  setToken(token)
}

export async function signIn(data: {
  name: string
  username: string
  email: string
  password: string
}): Promise<void> {
  const { token } = await apiFetch<{ token: string }>("/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(data),
  })
  setToken(token)
}

export function logout(): void {
  clearToken()
}
