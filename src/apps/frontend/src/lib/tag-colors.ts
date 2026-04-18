const cache = new Map<string, string>()

export function getTagColor(tagId: string): string {
  const cached = cache.get(tagId)
  if (cached) return cached
  let hash = 0
  for (let i = 0; i < tagId.length; i++) {
    hash = ((hash << 5) - hash + tagId.charCodeAt(i)) | 0
  }
  const color = `hsl(${Math.abs(hash) % 360}deg 65% 55%)`
  cache.set(tagId, color)
  return color
}
