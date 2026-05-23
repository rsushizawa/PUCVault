import { NextResponse } from "next/server";

const EXPRESS = process.env.NEXT_PUBLIC_API ?? "http://localhost:8000";

export async function POST() {
  const upstream = await fetch(`${EXPRESS}/auth/logout`, { method: "POST" });
  const data = await upstream.json();

  const response = NextResponse.json(data);
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
