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

export async function listarDenuncias(): Promise<Denuncia[]> {
  return (await apiFetch<Denuncia[]>("/denuncias/")) ?? []
}

// punicao: 0 = exclui postagem, 1 = exclui postagem + silencia, 2 = exclui usuário
export type Punicao = 0 | 1 | 2

export const PUNICOES: { value: Punicao; label: string }[] = [
  { value: 0, label: "Excluir conteúdo" },
  { value: 1, label: "Excluir conteúdo + silenciar autor" },
  { value: 2, label: "Excluir usuário" },
]

// tempo_silencio is a Postgres INTERVAL string, only used when punicao === 1
export const TEMPOS_SILENCIO: { value: string; label: string }[] = [
  { value: "1 hour", label: "1 hora" },
  { value: "12 hours", label: "12 horas" },
  { value: "1 day", label: "1 dia" },
  { value: "3 days", label: "3 dias" },
  { value: "7 days", label: "7 dias" },
]

export function resolverDenuncia(
  denunciaId: number,
  opts: {
    novoStatus?: "RESOLVIDA" | "IGNORADA"
    punicao?: Punicao | null
    tempoSilencio?: string | null
  } = {},
): Promise<void> {
  const { novoStatus = "RESOLVIDA", punicao = null, tempoSilencio = null } = opts
  return apiFetch(`/denuncias/${denunciaId}/resolver`, {
    method: "PATCH",
    body: JSON.stringify({
      novo_status: novoStatus,
      punicao,
      tempo_silencio: punicao === 1 ? tempoSilencio : null,
    }),
  })
}
