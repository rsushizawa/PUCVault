import { NextResponse } from "next/server";

const EXPRESS = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export async function POST(req: Request) {
  const body = await req.json();

  const upstream = await fetch(`${EXPRESS}/auth/verify-sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Forward the signup_token cookie so Express can read it.
      cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  const response = NextResponse.json(data, { status: upstream.status });

  // Forward Express's clear-cookie for signup_token on success.
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
