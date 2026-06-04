"use server";
import { serverFetch } from "@/lib/api/server";
import type { Comment } from "@/lib/api/types";

export async function createComment(
  postId: string,
  data: { content: string; parentId?: string },
): Promise<Comment> {
  return serverFetch(`/posts/${postId}/comments/create`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function voteComment(id: string, value: 1 | -1): Promise<void> {
  const action = value === 1 ? "upvote" : "downvote";
  await serverFetch(`/posts/${id}/${action}`, { method: "PATCH" });
}
