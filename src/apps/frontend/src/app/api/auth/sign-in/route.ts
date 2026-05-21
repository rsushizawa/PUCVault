import { NextResponse } from "next/server";

const EXPRESS = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export async function POST(req: Request) {
  const body = await req.json();

  const upstream = await fetch(`${EXPRESS}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  const response = NextResponse.json(data, { status: upstream.status });

  // Forward Express's signup_token Set-Cookie so the PIN-verify step can read it.
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
