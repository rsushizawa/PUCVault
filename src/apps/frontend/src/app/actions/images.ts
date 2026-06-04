"use server";
import { serverFormData } from "@/lib/api/server";

export async function uploadProfileImage(
  location: "perfil" | "banner",
  file: File,
): Promise<{ message: string; imageId?: string }> {
  const form = new FormData();
  form.append("file", file);
  return serverFormData(`/image/upload/${location}`, form);
}
