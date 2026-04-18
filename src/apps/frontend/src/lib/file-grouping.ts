import type { Tag } from "@/types/tag"
import { getTagColor } from "./tag-colors"

export type SortOption = "default" | "date" | "tag"

export type CourseFile = {
  id: string
  name: string
  uploadedAt: string
  tags: Tag[]
  postId: string
}

export type FileGroup = {
  label: string
  color: string
  files: CourseFile[]
}

export type Course = {
  id: string
  name: string
  files: CourseFile[]
}

export type Semester = {
  id: string
  name: string
  courses: Course[]
}

export function rainbowColor(index: number, total: number): string {
  const hue = Math.round((index / Math.max(total, 1)) * 360)
  return `hsl(${hue}deg 65% 55%)`
}

function groupFilesByYear(files: CourseFile[]): FileGroup[] {
  const byYear = new Map<string, CourseFile[]>()
  for (const file of files) {
    const year = new Date(file.uploadedAt).getFullYear().toString()
    if (!byYear.has(year)) byYear.set(year, [])
    byYear.get(year)!.push(file)
  }
  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a))
  return years.map((year, i) => ({
    label: year,
    color: rainbowColor(i, years.length),
    files: [...byYear.get(year)!].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    ),
  }))
}

function groupFilesByTag(files: CourseFile[]): FileGroup[] {
  const byTag = new Map<string, CourseFile[]>()
  for (const file of files) {
    const tag = file.tags[0]
    const key = tag?.id ?? "untagged"
    if (!byTag.has(key)) byTag.set(key, [])
    byTag.get(key)!.push(file)
  }
  const tagIds = [...byTag.keys()].sort()
  return tagIds.map((tagId) => {
    const groupFiles = byTag.get(tagId)!
    const label = groupFiles[0]?.tags[0]?.name ?? tagId
    return {
      label,
      color: getTagColor(tagId),
      files: [...groupFiles].sort((a, b) => a.name.localeCompare(b.name)),
    }
  })
}

export function getGroups(files: CourseFile[], sortBy: SortOption): FileGroup[] | null {
  if (sortBy === "date") return groupFilesByYear(files)
  if (sortBy === "tag") return groupFilesByTag(files)
  return null
}
