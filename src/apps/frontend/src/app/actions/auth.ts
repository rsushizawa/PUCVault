"use server";
import { cookies } from "next/headers";
import { SERVER_BASE_URL, serverFetch } from "@/lib/api/server";

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${SERVER_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail: email, password }),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message ?? "Login failed");
  }
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/auth_token=([^;]+)/);
    if (match) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", match[1], {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
        path: "/",
      });
    }
  }
}

export async function signIn(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<void> {
  const res = await fetch(`${SERVER_BASE_URL}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message ?? "Sign-in failed");
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

// FIX: no backend route exists to edit nome/nome_usuario. Blocked on the
// publico profile-update function + PATCH /user/me route (see TO-DO.md ### DB).
export async function updateMe(data: {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
}): Promise<void> {
  await serverFetch("/user/me", { method: "PATCH", body: JSON.stringify(data) });
}
