"use client";

import { useState } from "react";
import Link from "next/link";
import PostTag from "@/components/post-tag";
import DenunciaModal from "@/components/denuncia-modal";
import UserHoverCard from "@/components/user-hover-card";
import { ChevronDown, ChevronUp, MessageSquare, Flag } from "lucide-react";

interface PostCardProps {
  postId: string;
  communitySlug: string;
  forumId?: string;
  title: string;
  body: string;
  author: string;
  authorId?: string;
  cargo?: string;
  timestamp: string;
  tags: string[];
  voteCount: number;
  commentCount: number;
  onUpvote: () => void;
  onDownvote: () => void;
}

export default function PostCard({
  postId,
  communitySlug,
  forumId,
  title,
  body,
  author,
  authorId,
  cargo,
  timestamp,
  tags,
  voteCount,
  commentCount,
  onUpvote,
  onDownvote,
}: PostCardProps) {
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);
  const [reportTarget, setReportTarget] = useState<{ type: "usuario" | "conteudo"; id: number; label: string } | null>(null);

  function handleUpvote() {
    if (userVote === 1) {
      setUserVote(0);
    } else {
      setUserVote(1);
      onUpvote();
    }
  }

  function handleDownvote() {
    if (userVote === -1) {
      setUserVote(0);
    } else {
      setUserVote(-1);
      onDownvote();
    }
  }

  const displayCount = voteCount + userVote;
  const countColor =
    userVote === 1 ? "text-accent" : userVote === -1 ? "text-red-400" : "text-text-secondary";

  return (
    <>
      {reportTarget && (
        <DenunciaModal
          type={reportTarget.type}
          targetId={reportTarget.id}
          targetLabel={reportTarget.label}
          onClose={() => setReportTarget(null)}
        />
      )}

      <article className="flex gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 items-start w-full hover:bg-surface-raised transition-colors duration-150 group cursor-pointer">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            className={`p-1.5 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer active:animate-pop ${
              userVote === 1
                ? "text-accent bg-accent/10"
                : "text-text-muted hover:text-accent hover:bg-accent/10"
            }`}
            aria-label="upvote"
            onClick={handleUpvote}
          >
            <ChevronUp size={14} />
          </button>
          <span className={`font-bold text-xs text-center w-full transition-colors duration-150 ${countColor}`}>
            {displayCount}
          </span>
          <button
            className={`p-1.5 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer active:animate-pop ${
              userVote === -1
                ? "text-red-400 bg-red-400/10"
                : "text-text-muted hover:text-red-400 hover:bg-red-400/10"
            }`}
            aria-label="downvote"
            onClick={handleDownvote}
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Content */}
        <Link
          href={`/v/${communitySlug}/post/${postId}${forumId ? `?id=${forumId}` : ""}`}
          className="flex flex-col gap-1.5 flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex gap-2 items-center flex-wrap">
            {tags.map((tag) => (
              <PostTag key={tag} tag={tag} />
            ))}
            <span className="text-xs text-text-muted">
              por{" "}
              <UserHoverCard username={author.replace(/^u\//, "")} userId={authorId ?? ""}>
                <span className="text-text-secondary hover:text-accent transition-colors cursor-pointer">{author}</span>
              </UserHoverCard>
              {cargo && (
                <span className="ml-1.5 inline-flex items-center text-[10px] font-semibold px-1.5 py-px rounded bg-accent/10 text-accent border border-accent/20 align-middle">
                  {cargo}
                </span>
              )}
              {" · "}
              {timestamp}
            </span>
          </div>
          <h3 className="font-semibold text-lg text-text-primary leading-snug group-hover:text-accent/90 transition-colors duration-150">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{body}</p>
          <div className="flex gap-3 items-center pt-1">
            <span className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
              <MessageSquare size={12} />
              {commentCount} comentários
            </span>
          </div>
        </Link>

        {/* Report button */}
        <div className="shrink-0 flex flex-col gap-1 pt-1">
          <button
            type="button"
            aria-label="Denunciar conteúdo"
            onClick={(e) => {
              e.stopPropagation();
              setReportTarget({ type: "conteudo", id: Number(postId), label: title });
            }}
            className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <Flag size={12} />
          </button>
          {authorId && (
            <button
              type="button"
              aria-label="Denunciar autor"
              onClick={(e) => {
                e.stopPropagation();
                setReportTarget({ type: "usuario", id: Number(authorId), label: author });
              }}
              className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100 text-[9px] font-medium"
              title="Denunciar autor"
            >
              u/
            </button>
          )}
        </div>
      </article>
    </>
  );
}
