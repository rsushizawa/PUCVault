import { apiFormData, apiFetch } from "./client"

export function uploadProfileImage(location: "perfil" | "banner", file: File): Promise<{ message: string; imageId?: string }> {
  const form = new FormData()
  form.append("file", file)
  return apiFormData(`/image/upload/${location}`, form)
}

export function getProfileImageUrls(userId: string): Promise<{ img_perfil: string; img_banner: string }> {
  return apiFetch(`/image/get/user/${userId}`)
}

export function uploadForumImage(forumId: string, location: "perfil" | "banner", file: File): Promise<{ data?: { imageId?: string } }> {
  const form = new FormData()
  form.append("file", file)
  return apiFormData(`/image/${forumId}/upload/${location}`, form)
}

export function getForumImageUrls(forumId: string): Promise<{ img_perfil: string; img_banner: string }> {
  return apiFetch(`/image/get/forum/${forumId}`)
}
