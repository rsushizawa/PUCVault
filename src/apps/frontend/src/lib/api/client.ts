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
