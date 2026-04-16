interface PostTagProps {
  label: string;
  color?: string;
}

export default function PostTag({ label, color }: PostTagProps) {
  return (
    <span
      className="uppercase font-bold text-[10px] tracking-[0.5px] px-2 py-0.5 text-[#98cbff]"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
