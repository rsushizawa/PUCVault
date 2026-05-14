import { apiFetch, apiFormData } from "./client"
import type { Post } from "./types"
import { mapPostRow, calcTotal, type RawPostRow } from "./utils"

export async function getFeed(page = 1): Promise<{ posts: Post[]; total: number }> {
  const rows = await apiFetch<RawPostRow[]>(`/feed/page/${page}`)
  return { posts: rows.map(mapPostRow), total: calcTotal(rows, page) }
}

export async function getPost(id: string): Promise<Post> {
  const raw = await apiFetch<any>(`/posts/${id}`)
  if (!raw.arquivo && raw.arquivo_nome && raw.arquivo_caminho) {
    raw.arquivo = `${raw.arquivo_nome} ${raw.arquivo_caminho}`
  }
  return raw as Post
}

export function createPost(
  forumId: string,
  data: { title: string; content: string; tags: number[]; file?: File },
): Promise<{ message: string; file_id?: string }> {
  const form = new FormData()
  form.append("title", data.title)
  form.append("content", data.content)
  for (const tagId of data.tags) {
    form.append("tags", String(tagId))
  }
  if (data.file) form.append("file", data.file)
  return apiFormData(`/posts/${forumId}/create`, form, "POST")
}

export function votePost(id: string, value: 1 | -1): Promise<void> {
  return apiFetch(`/posts/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ value }),
  })
}
