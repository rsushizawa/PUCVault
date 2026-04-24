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
  const { id: communityId, postId } = useParams<{ id: string; postId: string }>();
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
      .catch(() => setError("Failed to load post."))
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleVote(value: 1 | -1) {
    await votePost(postId, value);
  }

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <main className="flex-1 px-8 py-6 max-w-4xl mx-auto w-full flex flex-col gap-4">
        <Link
          href={`/community/${communityId}`}
          className="flex items-center gap-1 text-text-muted hover:text-text-secondary text-sm w-fit"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to community
        </Link>

        {loading && (
          <p className="text-text-muted text-sm">Loading...</p>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {post && (
          <>
            <PostDetail
              post={post}
              communityId={communityId}
              onVote={handleVote}
            />
            <CommentSection comments={comments} postId={post.id} />
          </>
        )}
      </main>
    </div>
  );
}
