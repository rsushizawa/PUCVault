import type { Post } from "./types"

export const PAGE_SIZE = 20

export function normalizeTags(raw: unknown[]): string[] {
  return raw
    .filter((t) => t != null)
    .map((t: any) => (typeof t === "string" ? t : (t.tag ?? t.name ?? t.nome ?? "")))
    .filter((s: string) => s !== "")
}

export type RawPostRow = {
  id: number
  titulo: string
  conteudo: string
  nome_usuario: string
  img_perfil: string | null
  criado_em: string
  tags: any[]
  engajamento: number | string
  comentarios: number | string
  arquivo: string | null
  arquivo_nome: string | null
  arquivo_caminho: string | null
  forum?: number
  criador?: number
  cargo?: string
  status?: string
  nome?: string
  forum_nome?: string
  avaliacao_usuario_logado?: number | null
}

export function mapPostRow(row: RawPostRow): Post {
  return {
    id: row.id,
    titulo: row.titulo,
    arquivo: row.arquivo_nome && row.arquivo_caminho
      ? `${row.arquivo_nome} ${row.arquivo_caminho}`
      : (row.arquivo ?? null),
    forum: row.forum ?? 0,
    conteudo: row.conteudo,
    status: row.status ?? "",
    criado_em: row.criado_em,
    criador: row.criador ?? 0,
    nome_usuario: row.nome_usuario,
    cargo: row.cargo ?? "",
    img_perfil: row.img_perfil ?? null,
    tags: normalizeTags(row.tags ?? []),
    engajamento: String(row.engajamento),
    comentarios: String(row.comentarios),
    nome: row.nome ?? row.forum_nome,
    forum_nome: row.forum_nome,
    userVote: (row.avaliacao_usuario_logado === 1 || row.avaliacao_usuario_logado === -1
      ? row.avaliacao_usuario_logado
      : 0),
  }
}

export function calcTotal(rows: unknown[], page: number): number {
  return rows.length === PAGE_SIZE
    ? page * PAGE_SIZE + 1
    : (page - 1) * PAGE_SIZE + rows.length
}
