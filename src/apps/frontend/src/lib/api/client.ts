import { headers } from "next/headers";

// Add API_URL=http://localhost:8000 to .env.local. NEXT_PUBLIC_API_URL stays here for client-side use.
// TODO: Once authController sets the httpOnly cookie, replace header injection in all three functions below with:
//   credentials: 'include'   ← browser sends the cookie automatically, no Authorization header needed
// Also update the Express CORS config in the server entry point:
//   app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
//   A wildcard origin ('*') blocks credentialed requests — must be a specific origin string.
//
const BASE_URL = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export async function apiFetchPaginated<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T[]; total: number }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T; total: T };
  return { data: json.data as T[], total: json.total as number };
}

export async function apiFormData<T>(
  path: string,
  form: FormData,
  method = "PATCH",
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    body: form,
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}
