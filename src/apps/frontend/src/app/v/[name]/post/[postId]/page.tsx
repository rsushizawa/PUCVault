"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/navbar";
import PostDetail from "@/components/post-detail";
import CommentSection from "@/components/comment-section";
import { getPost, votePost } from "@/lib/api/posts";
import { getForums } from "@/lib/api/communities";
import type { Post } from "@/types/api";

export default function PostPage() {
  const { name, postId } = useParams<{ name: string; postId: string }>();
  const decodedName = decodeURIComponent(name);
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [post, setPost] = useState<Post | null>(null);
  const [communityName, setCommunityName] = useState(decodedName);
  const [communityId, setCommunityId] = useState(idParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPost(postId)
      .then((p) => {
        setPost(p);
        const fid = idParam ?? String(p.forum);
        setCommunityId(fid);
        if (p.forum_nome) {
          setCommunityName(p.forum_nome);
        } else if (!isNaN(Number(decodedName))) {
          // URL slug is numeric (came from feed without forum name) — resolve real name
          getForums()
            .then((forums) => {
              const match = forums.find((f) => f.id === Number(fid));
              if (match) setCommunityName(match.nome);
            })
            .catch(() => {});
        }
      })
      .catch(() => setError("Falha ao carregar post."))
      .finally(() => setLoading(false));
  }, [postId]);

  const backHref = `/v/${communityName}${communityId ? `?id=${communityId}` : ""}`;

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full flex flex-col gap-4">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-text-muted hover:text-accent text-sm w-fit transition-colors duration-150 cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
          Voltar para {communityName}
        </Link>

        {loading && (
          <p className="text-text-muted text-sm animate-fade-in">Carregando...</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {post && (
          <div className="animate-fade-in flex flex-col gap-4">
            <PostDetail
              post={post}
              communityId={communityName}
              onVote={(v) => votePost(postId, v).catch(() => {})}
            />
            <CommentSection postId={String(post.id)} />
          </div>
        )}
      </main>
    </div>
  );
}
