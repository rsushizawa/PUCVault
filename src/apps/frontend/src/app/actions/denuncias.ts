"use server";
import { serverFetch } from "@/lib/api/server";
import type { TipoDenuncia } from "@/lib/api/denuncias";

export async function denunciarUsuario(userId: number, tipo: TipoDenuncia): Promise<void> {
  await serverFetch("/denuncias/usuario", {
    method: "POST",
    body: JSON.stringify({ usuario_denunciado_id: userId, tipo }),
  });
}

export async function denunciarConteudo(conteudoId: number, tipo: TipoDenuncia): Promise<void> {
  await serverFetch("/denuncias/conteudo", {
    method: "POST",
    body: JSON.stringify({ conteudo_id: conteudoId, tipo }),
  });
}

export async function resolverDenuncia(
  denunciaId: number,
  novoStatus: "RESOLVIDA" | "IGNORADA" = "RESOLVIDA",
): Promise<void> {
  await serverFetch(`/denuncias/${denunciaId}/resolver`, {
    method: "PATCH",
    body: JSON.stringify({ novo_status: novoStatus }),
  });
}
