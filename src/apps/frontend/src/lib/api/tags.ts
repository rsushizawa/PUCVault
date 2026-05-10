import { apiFetch } from "./client";
import type { Tag } from "./types";

export function getForumTags(forumId: string): Promise<Tag[]> {
  return apiFetch(`/tags/forum/${forumId}`);
}

export function searchTags(query: string, forumId: string): Promise<Tag[]> {
  return apiFetch(`/tags/search?q=${encodeURIComponent(query)}`);
}

export async function createTag(name: string): Promise<Tag> {
  await apiFetch(`/tags/create`, { method: "POST", body: JSON.stringify({ name }) });
  // API returns { message: "success" }, so we search for the created tag by name
  const results = await searchTags(name, "");
  const created = results.find((t) => t.tag === name);
  if (created) return created;
  return { id: 0, tag: name, status: "ATIVO", total_usos: "0", relevancia: 0 };
}

export function deleteForumTag(forumId: string, tagId: number): Promise<void> {
  return apiFetch(`/tags/forum/${forumId}/${tagId}`, { method: "DELETE" });
}
