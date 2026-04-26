import { apiFetch } from "./client";
import type { Tag } from "@/types/tag";

export function getForumTags(forumId: string): Promise<Tag[]> {
  return apiFetch(`/tags/forum/${forumId}`);
}

export function searchTags(query: string, forumId: string): Promise<Tag[]> {
  return apiFetch(`/tags/search?q=${encodeURIComponent(query)}`);
}
