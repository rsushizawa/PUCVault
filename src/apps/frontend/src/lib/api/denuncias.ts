import { apiFetch } from "./client"

export type Denuncia = {
  id: number
  descricao: string
  status: string
  criado_em: string
  resolvido_em: string | null
  denunciante_id: number
  denunciado_id: number | null
  conteudo_id: number | null
  resolvedor_id: number | null
  denunciante_username?: string
}

export function denunciarUsuario(userId: number, descricao: string): Promise<void> {
  return apiFetch("/denuncias/usuario", {
    method: "POST",
    body: JSON.stringify({ userId, descricao }),
  })
}

export function denunciarConteudo(conteudoId: number, descricao: string): Promise<void> {
  return apiFetch("/denuncias/conteudo", {
    method: "POST",
    body: JSON.stringify({ conteudoId, descricao }),
  })
}

export function listarDenuncias(): Promise<Denuncia[]> {
  return apiFetch("/denuncias/")
}

export function resolverDenuncia(denunciaId: number): Promise<void> {
  return apiFetch(`/denuncias/${denunciaId}/resolver`, { method: "PATCH" })
}
