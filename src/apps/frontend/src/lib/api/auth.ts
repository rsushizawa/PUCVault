import { apiFetch } from "./client";
import type { User } from "./types";

export type UserProfile = User;

export async function getMe(): Promise<User> {
  return apiFetch<User>("/user/me");
}

export function updateMe(data: {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
}): Promise<void> {
  return apiFetch("/user/me", { method: "PATCH", body: JSON.stringify(data) });
}

export async function login(email: string, password: string): Promise<void> {
  await apiFetch<{ user: unknown; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ userEmail: email, password }),
  });
}

export async function signIn(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<void> {
  await apiFetch("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", {
    method: "POST",
  });
}
