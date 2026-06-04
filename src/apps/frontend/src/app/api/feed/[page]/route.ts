import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.API_URL ?? "http://localhost:8000";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${BASE_URL}/feed/page/${page}`, {
    headers: { Cookie: `auth_token=${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Feed fetch failed" }, { status: res.status });
  }

  const json = await res.json();
  return NextResponse.json(json);
}
