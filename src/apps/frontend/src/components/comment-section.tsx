"use client";

import { useState, useEffect, useCallback } from "react";
import CommentNode from "@/components/comment-node";
import CreatePost from "@/components/create-post";
import { getComments, createComment, voteComment } from "@/lib/api/comments";
import type { Comment } from "@/types/api";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(() => {
    getComments(postId).then(setComments).catch(() => {});
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleTopLevelComment(content: string) {
    await createComment(postId, { content });
    fetchComments();
  }

  async function handleVote(commentId: string, value: 1 | -1) {
    await voteComment(commentId, value);
  }

  async function handleReply(parentId: string, content: string) {
    await createComment(postId, { content, parentId });
    fetchComments();
  }

  return (
    <div className="flex flex-col gap-4">
      <CreatePost mode="comment" onComment={handleTopLevelComment} />

      <div className="bg-surface-raised px-5 pb-5 pt-3 rounded-sm">
        {comments.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-6">
            Nenhum comentário ainda. Seja o primeiro!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              onVote={handleVote}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  );
}
