import { NextResponse } from "next/server";

const EXPRESS = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export async function POST(req: Request) {
  const body = await req.json();

  const upstream = await fetch(`${EXPRESS}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // 2FA case: no auth cookie yet, just pass the token back to the client.
  if (data.twoFacToken) {
    return NextResponse.json({ twoFacToken: data.twoFacToken });
  }

  // Success: forward Express's auth_token Set-Cookie to the browser.
  const response = NextResponse.json({ ok: true });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
