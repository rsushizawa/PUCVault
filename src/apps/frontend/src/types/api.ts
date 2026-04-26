export type Post = {
  id: number
  titulo: string
  arquivo: string | null
  forum: number
  conteudo: string
  status: string
  criado_em: string
  tempo_de_vida?: {
    days: number
    hours: number
    minutes: number
    seconds: number
    milliseconds: number
  }
  criador: number
  nome_usuario: string
  cargo: string
  img_perfil: string | null
  tags: string[]
  engajamento: string
  comentarios: string
  nome?: string
  forum_nome?: string
}

// Recursive — API must return pre-nested tree (not flat array)
export type Comment = {
  id: string
  body: string
  author: { id: string; username: string; avatarUrl?: string }
  createdAt: string
  voteCount: number
  level: number
  children: Comment[]
}
