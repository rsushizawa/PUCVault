import { apiFetch } from "./client"

export type TipoDenuncia =
  | "CONTEUDO_INADEQUADO"
  | "SPAM"
  | "PLÁGIO"
  | "ASSÉDIO"
  | "INFORMACAO_FALSA"
  | "OUTRO"

export const TIPOS_DENUNCIA: { value: TipoDenuncia; label: string }[] = [
  { value: "CONTEUDO_INADEQUADO", label: "Conteúdo inadequado" },
  { value: "SPAM", label: "Spam" },
  { value: "PLÁGIO", label: "Plágio" },
  { value: "ASSÉDIO", label: "Assédio" },
  { value: "INFORMACAO_FALSA", label: "Informação falsa" },
  { value: "OUTRO", label: "Outro" },
]

export type Denuncia = {
  id: number
  tipo: TipoDenuncia
  status: string
  criado_em: string
  denunciante: string
  usuario_denunciado: number | null
  conteudo_denunciado: number | null
}

export function denunciarUsuario(userId: number, tipo: TipoDenuncia): Promise<void> {
  return apiFetch("/denuncias/usuario", {
    method: "POST",
    body: JSON.stringify({ usuario_denunciado_id: userId, tipo }),
  })
}

export function denunciarConteudo(conteudoId: number, tipo: TipoDenuncia): Promise<void> {
  return apiFetch("/denuncias/conteudo", {
    method: "POST",
    body: JSON.stringify({ conteudo_id: conteudoId, tipo }),
  })
}

export function listarDenuncias(): Promise<Denuncia[]> {
  return apiFetch("/denuncias/")
}

export function resolverDenuncia(denunciaId: number, novoStatus: "RESOLVIDA" | "IGNORADA" = "RESOLVIDA"): Promise<void> {
  return apiFetch(`/denuncias/${denunciaId}/resolver`, {
    method: "PATCH",
    body: JSON.stringify({ novo_status: novoStatus }),
  })
}
