import type { Tag } from "./tag"

export type UserSummary = {
  id: string
  username: string
  avatarUrl?: string
}

export type Community = {
  id: string
  name: string
  description: string
  bannerUrl?: string
  iconUrl?: string
  memberCount: number
  postCount: number
  isPublic: boolean
  createdAt: string
}

export type Post = {
  id: string
  title: string
  body: string
  author: UserSummary
  createdAt: string
  tags: Tag[]
  voteCount: number
  commentCount: number
  fileUrl?: string
  forumSlug?: string
}

// Recursive — API must return pre-nested tree (not flat array)
export type Comment = {
  id: string
  body: string
  author: UserSummary
  createdAt: string
  voteCount: number
  level: number  // 1–5, mirrors DB constraint
  children: Comment[]
}
