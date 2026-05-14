const cache = new Map<string, string>()

export function getTagColor(tagName: string): string {
  const cached = cache.get(tagName)
  if (cached) return cached
  let hash = 0
  for (let i = 0; i < tagName.length; i++) {
    hash = ((hash << 5) - hash + tagName.charCodeAt(i)) | 0
  }
  const color = `hsl(${Math.abs(hash) % 360}deg 65% 55%)`
  cache.set(tagName, color)
  return color
}
