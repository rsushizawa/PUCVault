"use server";
import { serverFetch } from "@/lib/api/server";
import { Cargo, CARGO_TO_ROLE_NUM } from "@/types/cargo";

export async function changeRole(userId: string, cargo: Cargo): Promise<void> {
  const roleNum = CARGO_TO_ROLE_NUM[cargo];
  await serverFetch(`/user/${userId}/change_role`, {
    method: "PATCH",
    body: JSON.stringify({ roleNum }),
  });
}

export async function followUser(targetId: string): Promise<void> {
  await serverFetch(`/user/${targetId}/follow`, { method: "PATCH" });
}
