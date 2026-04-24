import { apiFetch } from "./client"
import type { Post, Comment } from "@/types/api"

export function getPost(id: string): Promise<Post & { comments: Comment[] }> {
  return apiFetch(`/posts/${id}`)
}

export function createPost(
  forumId: string,
  data: { title: string; content: string; tags: number[]; filename?: string },
): Promise<Post> {
  return apiFetch(`/posts/${forumId}/create`, {
    method: "POST",
    body: JSON.stringify({ ...data, filename: data.filename ?? null }),
  })
}

export function votePost(id: string, value: 1 | -1): Promise<void> {
  return apiFetch(`/posts/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}

export function createComment(
  postId: string,
  data: { content: string; parentId?: string },
): Promise<Comment> {
  return apiFetch(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function voteComment(id: string, value: 1 | -1): Promise<void> {
  return apiFetch(`/comments/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}
