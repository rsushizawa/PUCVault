"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  FileText,
  MessageSquare,
  Flag,
} from "lucide-react";
import PostTag from "@/components/post-tag";
import MarkdownBody from "@/components/markdown-body";
import DenunciaModal from "@/components/denuncia-modal";
import UserHoverCard from "@/components/user-hover-card";
import type { Post } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getFileName(arquivo: string) {
  const parts = arquivo.trim().split(" ");
  parts.pop(); // remove cloudinary public_id
  return parts.join(" ");
}

function isImage(arquivo: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(getFileName(arquivo));
}

function isPdf(arquivo: string) {
  return /\.pdf$/i.test(getFileName(arquivo));
}

function fileUrl(postId: number, download = false) {
  return `${API_BASE}/posts/${postId}/files${download ? "?download=1" : ""}`;
}

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
  const [reportTarget, setReportTarget] = useState<{
    type: "usuario" | "conteudo";
    id: number;
    label: string;
  } | null>(null);

  function handleVote(value: 1 | -1) {
    const next = vote === value ? null : value;
    setVote(next);
    if (next !== null) onVote(value);
  }

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
            {Number(post.engajamento) + (vote ?? 0)}
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
            {(post.tags ?? []).map((tag) => (
              <PostTag key={tag} tag={tag} />
            ))}
            <span className="text-xs text-text-muted">
              Postado por{" "}
              <UserHoverCard
                username={post.nome_usuario}
                userId={String(post.criador)}
              >
                <Link
                  href={`/u/${post.nome_usuario}`}
                  className="hover:text-text-secondary"
                >
                  u/{post.nome_usuario}
                </Link>
              </UserHoverCard>{" "}
              · {formatDate(post.criado_em)}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-semibold text-2xl text-text-primary leading-tight">
            {post.titulo}
          </h1>

          {/* Body — rendered as markdown */}
          <MarkdownBody>{post.conteudo}</MarkdownBody>

          {/* File attachment / preview */}
          {post.arquivo && (
            <div className="flex flex-col gap-2">
              {isImage(post.arquivo) ? (
                <img
                  src={fileUrl(post.id)}
                  alt="Anexo"
                  className="max-w-full max-h-[400px] rounded-lg object-contain border border-surface-overlay"
                />
              ) : isPdf(post.arquivo) ? (
                <embed
                  src={fileUrl(post.id)}
                  type="application/pdf"
                  className="w-full h-[500px] rounded-lg border border-surface-overlay"
                />
              ) : null}
              <a
                href={fileUrl(post.id, true)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-accent text-sm hover:underline w-fit"
              >
                <FileText size={15} aria-hidden />
                {isPdf(post.arquivo) ? "Abrir PDF" : "Download"}
              </a>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-text-muted pt-3 border-t border-surface-overlay">
            <MessageSquare size={13} aria-hidden />
            <span>{Number(post.comentarios)} comments</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() =>
                setReportTarget({
                  type: "conteudo",
                  id: post.id,
                  label: post.titulo,
                })
              }
              className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer"
              title="Denunciar post"
            >
              <Flag size={12} />
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
