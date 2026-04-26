import { getTagColor } from "@/lib/tag-colors"

interface PostTagProps {
  tag: string
}

export default function PostTag({ tag }: PostTagProps) {
  return (
    <span
      className="uppercase font-bold text-[10px] tracking-[0.5px] px-2 py-0.5 bg-surface-overlay rounded"
      style={{ color: getTagColor(tag) }}
    >
      {tag}
    </span>
  )
}
