"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, FileText, MessageSquare } from "lucide-react";
import PostTag from "@/components/post-tag";
import MarkdownBody from "@/components/markdown-body";
import type { Post } from "@/types/api";

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface PostDetailProps {
  post: Post;
  communityId: string;
  onVote: (value: 1 | -1) => void;
}

export default function PostDetail({
  post,
  communityId,
  onVote,
}: PostDetailProps) {
  const [vote, setVote] = useState<1 | -1 | null>(null);

  function handleVote(value: 1 | -1) {
    const next = vote === value ? null : value;
    setVote(next);
    if (next !== null) onVote(value);
  }

  return (
    <article className="bg-surface-raised flex gap-5 p-5 items-start rounded-sm w-full">
      {/* Vote column */}
      <div className="w-[30px] bg-[#0e0e0e] flex flex-col items-center p-1 rounded-sm shrink-0">
        <button
          className="p-1 flex items-center justify-center"
          aria-label="upvote"
          onClick={() => handleVote(1)}
        >
          <ChevronUp
            size={14}
            className={vote === 1 ? "text-accent" : "text-text-secondary"}
          />
        </button>
        <span className="font-bold text-xs text-text-secondary text-center w-full">
          {post.voteCount + (vote ?? 0)}
        </span>
        <button
          className="p-1 flex items-center justify-center"
          aria-label="downvote"
          onClick={() => handleVote(-1)}
        >
          <ChevronDown
            size={14}
            className={vote === -1 ? "text-[#f97316]" : "text-text-secondary"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex gap-2 items-center flex-wrap">
          {post.tags.map((tag) => (
            <PostTag key={tag.id} tag={tag} />
          ))}
          <span className="text-xs text-text-muted">
            Posted by{" "}
            <Link
              href={`/user/${post.author.username}`}
              className="hover:text-text-secondary"
            >
              u/{post.author.username}
            </Link>{" "}
            · {formatDate(post.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-semibold text-2xl text-text-primary leading-tight">
          {post.title}
        </h1>

        {/* Body — rendered as markdown */}
        <MarkdownBody>{post.body}</MarkdownBody>

        {/* File attachment */}
        {post.fileUrl && (
          <a
            href={post.fileUrl}
            download
            className="flex items-center gap-2 text-accent text-sm hover:underline w-fit"
          >
            <FileText size={15} aria-hidden />
            Download attachment
          </a>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 text-xs text-text-muted pt-3 border-t border-surface-overlay">
          <MessageSquare size={13} aria-hidden />
          <span>{post.commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
