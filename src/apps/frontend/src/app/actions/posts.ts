"use server";
import { serverFetch, serverFormData } from "@/lib/api/server";

export async function votePost(id: string, value: 1 | 0 | -1): Promise<void> {
  await serverFetch(`/posts/rate-content`, {
    method: "PATCH",
    body: JSON.stringify({ rate_vector: [[Number(id)], [value]] }),
  });
}

export async function createPost(
  forumId: string,
  data: { title: string; content: string; tags: number[]; file?: File },
): Promise<{ message: string; file_id?: string }> {
  const form = new FormData();
  form.append("title", data.title);
  form.append("content", data.content);
  for (const tagId of data.tags) {
    form.append("tags", String(tagId));
  }
  if (data.file) form.append("file", data.file);
  return serverFormData(`/posts/${forumId}/create`, form, "POST");
}
