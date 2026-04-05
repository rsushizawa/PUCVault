"use client";

import PostTag from "@/components/post-tag";
import { ChevronDown, ChevronUp } from "lucide-react";
interface PostTagData {
  label: string;
  color: string;
}

interface PostCardProps {
  title: string;
  body: string;
  author: string;
  timestamp: string;
  tags: PostTagData[];
  voteCount: number;
  commentCount: number;
  onUpvote: () => void;
  onDownvote: () => void;
}

export default function PostCard({
  title,
  body,
  author,
  timestamp,
  tags,
  voteCount,
  commentCount,
  onUpvote,
  onDownvote,
}: PostCardProps) {
  return (
    <article className="max-w-[770px] bg-surface-raised flex gap-5 p-5 items-start rounded-sm w-full">
      {/* Left column: cote button + count */}
      <div className="w-[30px] bg-[#0e0e0e] flex flex-col items-center p-1 rounded-sm ">
        <button
          className="p-1 flex items-center justify-center"
          aria-label="upvote"
          onClick={onUpvote}
        >
          <ChevronUp size={10} />
        </button>
        <span className="font-bold text-xs text-text-secondary text-center w-full">
          {voteCount}
        </span>
        <button
          className="p-1 flex items-center justify-center"
          aria-label="downvote"
          onClick={onDownvote}
        >
          <ChevronDown size={10} />
        </button>
      </div>
      {/* Right colomn> content */}
      <div className="flex flex-col gap-[7px] flex-1 min-w-0">
        <div className="flex gap-2 items-center">
          {tags.map((tagProp) => (
            <PostTag key={tagProp.label} {...tagProp} />
          ))}
          <span className="text-xs text-text-secondary">
            Posted by <span>{author}</span> <span>{timestamp}</span>
          </span>
        </div>
        <h3 className="font-medium text-[20px] text-text-primary leading-[27.5px]">
          {title}
        </h3>
        <span className="text-sm text-text-secondary leading-5">{body}</span>
        <div className="flex gap-4 items-center pt-[9px]">
          <span className="text-xs font-semibold text-text-secondary uppercase">
            {commentCount} Comments
          </span>
        </div>
      </div>
    </article>
  );
}
