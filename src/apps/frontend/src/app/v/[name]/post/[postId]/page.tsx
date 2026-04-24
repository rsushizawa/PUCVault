"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/navbar";
import PostDetail from "@/components/post-detail";
import CommentSection from "@/components/comment-section";
import { getPost, votePost } from "@/lib/api/posts";
import type { Post, Comment } from "@/types/api";

export default function PostPage() {
  const { name, postId } = useParams<{ name: string; postId: string }>();
  const decodedName = decodeURIComponent(name);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPost(postId)
      .then(({ comments: c, ...p }) => {
        setPost(p);
        setComments(c);
      })
      .catch(() => setError("Falha ao carregar post."))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full flex flex-col gap-4">
        <Link
          href={`/v/${decodedName}`}
          className="flex items-center gap-1.5 text-text-muted hover:text-accent text-sm w-fit transition-colors duration-150 cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
          Voltar para {decodedName}
        </Link>

        {loading && (
          <p className="text-text-muted text-sm animate-fade-in">Carregando...</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {post && (
          <div className="animate-fade-in flex flex-col gap-4">
            <PostDetail
              post={post}
              communityId={decodedName}
              onVote={(v) => votePost(postId, v).catch(() => {})}
            />
            <CommentSection comments={comments} postId={post.id} />
          </div>
        )}
      </main>
    </div>
  );
}
