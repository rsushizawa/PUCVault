"use client";
import { useState } from "react";

interface CreatePostProps {
  onPost: (content: string) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");

  function handlePost() {
    onPost(content);
    setContent("");
    setIsExpanded(false);
  }

  function handleCancel() {
    setContent("");
    setIsExpanded(false);
  }

  if (!isExpanded) {
    return (
      <div className="bg-surface-raised p-4 rounded-sm w-full max-w-[770px]">
        <input
          className="bg-surface-input w-full px-4 py-2 rounded-sm text-sm text-text-muted cursor-pointer outline-none"
          role="button"
          readOnly
          onClick={() => setIsExpanded(true)}
          placeholder="Ask a question or share an insight..."
        />
      </div>
    );
  }
  return (
    <div className="bg-surface-raised p-4 rounded-sm w-full max-w-[770px] flex flex-col gap-3">
      <textarea
        className="bg-surface-raised p-4 rounded-sm text-sm text-text-secondary placeholde: text-text-muted outline-none resize-none min-h-[180px]"
        value={content}
        role="textbox"
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ask a question or share an insight..."
      ></textarea>
      <div className="flex- justify-end gap-3">
        <button
          className="px-4 py-2 rounded-sm text-sm text-text-secondary border border-surface-overlay"
          type="button"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-sm text-sm bg-accent text-surface-base font-semibold"
          type="button"
          onClick={handlePost}
        >
          Post
        </button>
      </div>
    </div>
  );
}
