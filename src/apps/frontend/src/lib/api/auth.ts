import { apiFetch } from "./client";
import type { User } from "./types";

export type UserProfile = User;

export async function getMe(): Promise<User> {
  return apiFetch<User>("/user/me");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({
      password: currentPassword,
      new_password: newPassword,
      confirm: newPassword,
    }),
  });
}

// FIX: no backend route exists yet to edit nome/nome_usuario. Blocked on the
// publico profile-update function + PATCH /user/me route (see TO-DO.md ### DB).
export function updateMe(data: {
  username?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<void> {
  return apiFetch("/user/me", { method: "PATCH", body: JSON.stringify(data) });
}

export async function login(
  email: string,
  password: string,
): Promise<{ twoFacToken?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail: email, password }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  const json = await res.json();
  return { twoFacToken: json.twoFacToken };
}

export class VerifyLoginError extends Error {
  constructor(public status: number) {
    super(`verify-login failed: ${status}`);
    this.name = "VerifyLoginError";
  }
  // 403 means the twoFacToken expired; the user must restart from credentials.
  get expired() {
    return this.status === 403;
  }
}

export async function verifyLogin(
  twoFacToken: string,
  pin: string,
): Promise<void> {
  const res = await fetch("/api/auth/verify-login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ twoFacToken, pin_input: pin }),
  });
  if (!res.ok) throw new VerifyLoginError(res.status);
}

export async function signIn(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<void> {
  const res = await fetch("/api/auth/sign-in", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`sign-in failed: ${res.status}`);
}

// Confirms the email-verification PIN. The signup_token travels as an httpOnly
// cookie set during signIn, so only the PIN is sent here.
export async function verifySignup(pin: string): Promise<void> {
  const res = await fetch("/api/auth/verify-sign-in", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin_input: pin }),
  });
  if (!res.ok) throw new Error(`verify-sign-in failed: ${res.status}`);
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

const API_BASE = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

// Flips the caller's 2FA flag server-side. The backend reads the user from the
// auth cookie, so no body is needed; refetch getMe afterwards for the new state.
export async function toggle2FA(): Promise<void> {
  await apiFetch("/user/toggle-2fa", { method: "PATCH" });
}

// Forgot-password endpoints set no cookies and return { message, pinToken }
// (not the { data } envelope apiFetch expects), so they use raw fetch.
export async function forgotSendEmail(email: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/forgot-send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`forgot-send-email failed: ${res.status}`);
  const json = (await res.json()) as { pinToken: string };
  return json.pinToken;
}

export async function forgotResetPassword(data: {
  pinToken: string;
  pin: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pinToken: data.pinToken,
      pin: data.pin,
      new_password: data.newPassword,
      confirm: data.newPassword,
    }),
  });
  if (!res.ok) throw new Error(`forgot-password failed: ${res.status}`);
}
