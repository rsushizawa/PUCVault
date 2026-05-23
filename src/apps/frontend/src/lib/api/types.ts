export type Forum = {
  id: number
  nome: string
  descricao: string
  status: "ESPERA" | "ATIVO" | "RECUSADO"
  criado_em: string
  // Not returned by listar_foruns()/getSingleForum — only present on richer queries
  excluido_em?: string | null
  status_modificado_em?: string | null
  criador?: number
  validador?: number | null
  identidade_visual?: number
  total_posts?: number | string
  // Extended fields present on listing / getSingleForum responses
  nome_usuario?: string
  seguidores?: string
  img_perfil?: string | null
  img_banner?: string | null
  user_status?: string | number | boolean
}

export type Post = {
  id: number
  titulo: string
  arquivo: string | null
  forum: number
  forum_nome?: string
  nome?: string       // legacy alias for forum_nome — remove after DB-2
  conteudo: string
  status: string
  criado_em: string
  criador: number
  nome_usuario: string
  cargo: string
  img_perfil: string | null
  tags: string[]
  engajamento: string
  comentarios: string
  // Logged-in user's current rating on this post: -1, 0, or 1.
  userVote: 1 | 0 | -1
}

export type Comment = {
  id: string
  body: string
  author: { id: string; username: string; avatarUrl?: string }
  createdAt: string
  voteCount: number
  level: number
  children: Comment[]
}

// Matches privado.perfil_usuario view + optional fields not yet in the view
export type User = {
  id: number
  nome: string
  nome_usuario: string
  descricao?: string | null
  status: string
  criado_em: string
  a2f?: boolean
  identidade_visual?: number
  img_perfil: string | null
  img_banner?: string | null
  seguidores?: string
  segue?: string
  karma?: string
  cargo?: string
}

export type Tag = {
  id: number
  tag: string
  status?: string
  total_usos: string
  relevancia: number
}
