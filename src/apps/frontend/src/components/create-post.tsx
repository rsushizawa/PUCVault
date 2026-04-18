"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import MarkdownEditor from "@/components/markdown-editor";
import { getTagColor } from "@/lib/tag-colors";

interface CreatePostProps {
  onPost: (content: string, tags: string[], notifyOnReply: boolean) => void;
  availableTags?: string[];
}

export default function CreatePost({
  onPost,
  availableTags = ["question", "resource", "discussion"],
}: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notifyOnReply, setNotifyOnReply] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const allTags = [...availableTags, ...customTags];

  function handlePost() {
    onPost(content, selectedTags, notifyOnReply);
    setSelectedTags([]);
    setContent("");
    setIsExpanded(false);
    setNotifyOnReply(false);
    setCustomTags([]);
    setIsAddingTag(false);
    setNewTagInput("");
  }

  function handleCancel() {
    setContent("");
    setSelectedTags([]);
    setIsExpanded(false);
    setNotifyOnReply(false);
    setCustomTags([]);
    setIsAddingTag(false);
    setNewTagInput("");
  }

  function handleConfirmNewTag() {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !allTags.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
      setSelectedTags([...selectedTags, trimmed]);
    }
    setNewTagInput("");
    setIsAddingTag(false);
  }

  function handleNewTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleConfirmNewTag();
    if (e.key === "Escape") {
      setNewTagInput("");
      setIsAddingTag(false);
    }
  }

  function handleTagToggle(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((str) => str !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  if (!isExpanded) {
    return (
      <div className="bg-surface-raised p-4 rounded-sm w-full">
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
    <div className="bg-surface-raised p-4 rounded-sm w-full flex flex-col gap-3">
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder="Ask a question or share an insight..."
        minHeight="180px"
      />

      <div className="flex gap-2 items-center flex-wrap">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selectedTags.includes(tag)}
            onClick={() => handleTagToggle(tag)}
            className={`uppercase font-bold text-[10px] tracking-[0.5px] px-2 py-0.5 bg-surface-overlay rounded transition-opacity ${selectedTags.includes(tag) ? "opacity-100" : "opacity-40"}`}
            style={{ color: getTagColor(tag) }}
          >
            {tag}
          </button>
        ))}
        {isAddingTag ? (
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleNewTagKeyDown}
            onBlur={handleConfirmNewTag}
            placeholder="new tag"
            aria-label="New tag name"
            className="rounded-full border border-text-secondary bg-transparent px-4 py-2 text-sm text-text-secondary placeholder:text-text-muted outline-none w-28"
            autoFocus
          />
        ) : (
          <button
            type="button"
            aria-label="Add tag"
            onClick={() => setIsAddingTag(true)}
            className="bg-text-secondary text-surface-base rounded-full p-3 flex items-center justify-center"
          >
            <Plus size={12} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={notifyOnReply}
            onChange={(e) => setNotifyOnReply(e.target.checked)}
            className="rounded border-text-secondary w-5 h-5 cursor-pointer accent-accent"
          />
          Send me post reply notifications
        </label>
        <div className="flex-1" />
        <button
          className="px-4 py-2 rounded-sm text-sm text-text-secondary border border-surface-overlay"
          type="button"
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-sm text-sm bg-accent text-surface-base font-semibold border border-text-secondary"
          type="button"
          onClick={handlePost}
        >
          Post
        </button>
      </div>
    </div>
  );
}
