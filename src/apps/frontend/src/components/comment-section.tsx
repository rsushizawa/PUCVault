"use client";

import { useState } from "react";
import CommentNode from "@/components/comment-node";
import MarkdownEditor from "@/components/markdown-editor";
import { createComment, voteComment } from "@/lib/api/posts";
import type { Comment } from "@/types/api";

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
}

export default function CommentSection({ comments, postId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  async function handleTopLevelComment() {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    await createComment(postId, { content: trimmed });
    setNewComment("");
  }

  async function handleVote(commentId: string, value: 1 | -1) {
    await voteComment(commentId, value);
  }

  async function handleReply(parentId: string, content: string) {
    await createComment(postId, { content, parentId });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Top-level comment composer */}
      <div className="bg-surface-raised p-4 rounded-sm flex flex-col gap-2">
        <MarkdownEditor
          value={newComment}
          onChange={setNewComment}
          placeholder="Add a comment..."
          minHeight="100px"
        />
        <div className="flex justify-end">
          <button
            onClick={handleTopLevelComment}
            className="px-4 py-2 text-sm bg-accent text-surface-base font-semibold rounded-sm"
          >
            Comment
          </button>
        </div>
      </div>

      {/* Comment tree */}
      <div className="bg-surface-raised px-5 pb-5 pt-3 rounded-sm">
        {comments.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-6">
            No comments yet. Be the first!
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
