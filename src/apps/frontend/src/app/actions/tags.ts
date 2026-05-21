"use server";
import { serverFetch } from "@/lib/api/server";
import type { Tag } from "@/lib/api/types";

export async function createTag(name: string): Promise<Tag> {
  await serverFetch(`/tags/create`, { method: "POST", body: JSON.stringify({ name }) });
  const results = await serverFetch<Tag[]>(`/tags/search?q=${encodeURIComponent(name)}`);
  const created = results.find((t) => t.tag === name);
  if (created) return created;
  return { id: 0, tag: name, status: "ATIVO", total_usos: "0", relevancia: 0 };
}

// FIX: no backend route for forum-scoped tags yet (see TO-DO.md ### DB).
export async function deleteForumTag(forumId: string, tagId: number): Promise<void> {
  await serverFetch(`/tags/forum/${forumId}/${tagId}`, { method: "DELETE" });
}
