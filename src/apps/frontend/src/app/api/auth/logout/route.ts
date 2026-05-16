import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const cookiesStore = await cookies();
  cookiesStore.delete("token");

  return NextResponse.json({ ok: true });
}
