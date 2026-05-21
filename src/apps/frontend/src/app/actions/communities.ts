"use server";
import { serverFetch } from "@/lib/api/server";
import type { Forum } from "@/lib/api/types";

export async function createForum(nome: string, descricao: string): Promise<Forum> {
  return serverFetch("/forums/create", {
    method: "POST",
    body: JSON.stringify({ nome, descricao }),
  });
}

export async function updateForumDescription(id: string, descricao: string): Promise<void> {
  await serverFetch(`/forums/${id}/update`, {
    method: "PATCH",
    body: JSON.stringify({ descricao }),
  });
}

export async function validateForum(id: string): Promise<void> {
  await serverFetch(`/forums/${id}/validate`, { method: "PATCH" });
}

export async function followCommunity(id: string): Promise<void> {
  await serverFetch(`/forums/${id}/follow`, { method: "POST" });
}
