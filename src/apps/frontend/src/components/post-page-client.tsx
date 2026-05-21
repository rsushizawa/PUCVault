"use client";

import PostDetail from "@/components/post-detail";
import CommentSection from "@/components/comment-section";
import { votePost } from "@/app/actions/posts";
import type { Post } from "@/types/api";

export function PostPageClient({
  post,
  communityName,
}: {
  post: Post;
  communityName: string;
}) {
  return (
    <div className="animate-fade-in flex flex-col gap-4">
      <PostDetail
        post={post}
        communityId={communityName}
        onVote={(v) => {
          votePost(String(post.id), v).catch(() => {});
        }}
      />
      <CommentSection postId={String(post.id)} />
    </div>
  );
}
