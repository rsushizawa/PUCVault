"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, MessageSquare, Flag } from "lucide-react";
import MarkdownBody from "@/components/markdown-body";
import MarkdownEditor from "@/components/markdown-editor";
import DenunciaModal from "@/components/denuncia-modal";
import UserHoverCard from "@/components/user-hover-card";
import type { Comment } from "@/types/api";

const INDENT_COLOR = "#6c8ebf";

function formatDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function countDescendants(comment: Comment): number {
  return comment.children.reduce((n, c) => n + 1 + countDescendants(c), 0);
}

interface CommentNodeProps {
  comment: Comment;
  depth?: number;
  onVote: (commentId: string, value: 1 | -1) => void;
  onReply: (parentId: string, content: string) => void;
}

export default function CommentNode({
  comment,
  depth = 0,
  onVote,
  onReply,
}: CommentNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [vote, setVote] = useState<1 | -1 | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: "usuario" | "conteudo"; id: number; label: string } | null>(null);

  const color = INDENT_COLOR;
  const maxDepth = 4;

  function handleVote(value: 1 | -1) {
    const next = vote === value ? null : value;
    setVote(next);
    if (next !== null) onVote(comment.id, value);
  }

  function submitReply() {
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    onReply(comment.id, trimmed);
    setReplyContent("");
    setReplying(false);
  }

  const descendantCount = countDescendants(comment);

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
    <div className={`flex gap-2 ${depth === 0 ? "mt-4" : "mt-2"}`}>
      {depth > 0 && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-[2px] self-stretch rounded-full shrink-0 hover:opacity-50 transition-opacity cursor-pointer"
          style={{ backgroundColor: color }}
          aria-label={collapsed ? "Expand thread" : "Collapse thread"}
        />
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs">
          {depth === 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="font-mono text-[10px] text-text-muted hover:text-text-secondary leading-none"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? "[+]" : "[–]"}
            </button>
          )}
          <UserHoverCard username={comment.author.username} userId={comment.author.id}>
            <span className="font-semibold text-text-secondary hover:text-accent transition-colors cursor-pointer">
              u/{comment.author.username}
            </span>
          </UserHoverCard>
          <span className="text-text-muted">{formatDate(comment.createdAt)}</span>
          {collapsed && descendantCount > 0 && (
            <span className="text-text-muted italic">
              ({descendantCount} {descendantCount === 1 ? "reply" : "replies"} hidden)
            </span>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Body — rendered as markdown */}
            <div className="mt-1">
              <MarkdownBody>{comment.body}</MarkdownBody>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-1.5">
              <button
                onClick={() => handleVote(1)}
                aria-label="upvote comment"
                className="flex items-center"
              >
                <ChevronUp
                  size={13}
                  className={vote === 1 ? "text-accent" : "text-text-muted hover:text-accent"}
                />
              </button>
              <span className="text-xs text-text-muted font-bold">
                {comment.voteCount + (vote ?? 0)}
              </span>
              <button
                onClick={() => handleVote(-1)}
                aria-label="downvote comment"
                className="flex items-center"
              >
                <ChevronDown
                  size={13}
                  className={
                    vote === -1 ? "text-[#f97316]" : "text-text-muted hover:text-[#f97316]"
                  }
                />
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => setReplying(!replying)}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  <MessageSquare size={11} aria-hidden />
                  Reply
                </button>
              )}
              <button
                type="button"
                onClick={() => setReportTarget({ type: "conteudo", id: Number(comment.id), label: `comentário de u/${comment.author.username}` })}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors ml-1 cursor-pointer"
                title="Denunciar comentário"
              >
                <Flag size={11} />
              </button>
              <button
                type="button"
                onClick={() => setReportTarget({ type: "usuario", id: Number(comment.author.id), label: `u/${comment.author.username}` })}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                title="Denunciar usuário"
              >
                <Flag size={11} />
                <span className="text-[10px]">u/</span>
              </button>
            </div>

            {/* Inline reply composer */}
            {replying && (
              <div className="mt-2 flex flex-col gap-2">
                <MarkdownEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder="Write a reply..."
                  minHeight="80px"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setReplying(false);
                      setReplyContent("");
                    }}
                    className="text-xs text-text-muted px-3 py-1.5 rounded-sm border border-surface-overlay"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReply}
                    className="text-xs bg-accent text-surface-base font-semibold px-3 py-1.5 rounded-sm"
                  >
                    Reply
                  </button>
                </div>
              </div>
            )}

            {/* Recursive children */}
            <div>
              {comment.children.map((child) => (
                <CommentNode
                  key={child.id}
                  comment={child}
                  depth={depth + 1}
                  onVote={onVote}
                  onReply={onReply}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
