import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api/client";

export async function POST(req: Request) {
  const body = await req.json();

  const { token } = await apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const cookiesStore = await cookies();
  cookiesStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
