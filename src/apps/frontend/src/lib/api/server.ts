import { cookies } from "next/headers";

export const SERVER_BASE_URL = process.env.API_URL ?? "http://localhost:8000";

async function authCookieHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get("auth_token")?.value;
  return token ? { Cookie: `auth_token=${token}` } : {};
}

export async function serverFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${SERVER_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authCookieHeader()),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export async function serverFormData<T>(
  path: string,
  form: FormData,
  method = "PATCH",
): Promise<T> {
  const res = await fetch(`${SERVER_BASE_URL}${path}`, {
    method,
    body: form,
    headers: await authCookieHeader(),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}
