// BUG: `next/headers` is a Server Component-only API but client.ts is imported by Client Components
// (page.tsx → posts.ts → client.ts and layout.tsx → auth.ts → client.ts).
// Importing it here causes a build error: "You're importing a module that depends on next/headers".
// Fix: remove this import entirely. If server-side cookie forwarding is needed, split client.ts into
// two files — serverFetch.ts (imports next/headers, used only in async Server Components) and
// client.ts (no next/headers, used in Client Components). `credentials: "include"` already handles
// cookie forwarding for client-side fetches via the browser.

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
