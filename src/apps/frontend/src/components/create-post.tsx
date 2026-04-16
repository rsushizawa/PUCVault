"use client";
import { useRef, useState } from "react";
import {
  Bold, Italic, Link, Strikethrough, Code,
  List, ListOrdered, Quote, Image, Monitor,
  CircleHelp, BookOpen, Lightbulb, Plus,
} from "lucide-react";

interface CreatePostProps {
  onPost: (content: string, tags: string[], notifyOnReply: boolean) => void;
  availableTags?: string[];
}

const TAG_ICONS: Record<string, React.ReactNode> = {
  question: <CircleHelp size={15} aria-hidden />,
  resource: <BookOpen size={15} aria-hidden />,
  discussion: <Lightbulb size={15} aria-hidden />,
};

function ToolbarDivider() {
  return <div className="w-px h-6 bg-text-secondary/40 mx-1 shrink-0" />;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const newTagInputRef = useRef<HTMLInputElement>(null);

  const allTags = [...availableTags, ...customTags];

  function applyInlineFormat(before: string, after = before, placeholder = "") {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || placeholder;
    setContent(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function applyLinePrefix(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, value } = el;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    setContent(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + prefix.length, selectionStart + prefix.length);
    });
  }

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
      <div className="bg-surface-input rounded-sm overflow-hidden">
        <textarea
          ref={textareaRef}
          className="bg-surface-input w-full px-4 pt-4 pb-2 text-sm text-text-secondary placeholder:text-text-muted outline-none resize-none min-h-[180px]"
          value={content}
          role="textbox"
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ask a question or share an insight..."
        />
        <div className="bg-surface-raised flex items-center gap-0.5 px-2 py-1.5">
          <button type="button" aria-label="Bold" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("**", "**", "bold text")}><Bold size={15} aria-hidden /></button>
          <button type="button" aria-label="Italic" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("*", "*", "italic text")}><Italic size={15} aria-hidden /></button>
          <button type="button" aria-label="Link" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("[", "](url)", "link text")}><Link size={15} aria-hidden /></button>
          <button type="button" aria-label="Strikethrough" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("~~", "~~", "strikethrough text")}><Strikethrough size={15} aria-hidden /></button>
          <button type="button" aria-label="Code" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("`", "`", "code")}><Code size={15} aria-hidden /></button>
          <ToolbarDivider />
          <button type="button" aria-label="Bulleted list" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyLinePrefix("- ")}><List size={15} aria-hidden /></button>
          <button type="button" aria-label="Numbered list" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyLinePrefix("1. ")}><ListOrdered size={15} aria-hidden /></button>
          <button type="button" aria-label="Quote" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyLinePrefix("> ")}><Quote size={15} aria-hidden /></button>
          <ToolbarDivider />
          <div className="flex-1" />
          <button type="button" aria-label="Insert image" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("![", "](url)", "alt text")}><Image size={15} aria-hidden /></button>
          <button type="button" aria-label="Embed" className="p-2 rounded text-text-secondary hover:text-text-primary" onClick={() => applyInlineFormat("[embed](", ")", "url")}><Monitor size={15} aria-hidden /></button>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={selectedTags.includes(tag)}
            onClick={() => handleTagToggle(tag)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize ${selectedTags.includes(tag) ? "bg-accent border-accent text-surface-base" : "border-text-secondary text-text-secondary"}`}
          >
            {TAG_ICONS[tag]}
            {tag}
          </button>
        ))}
        {isAddingTag ? (
          <input
            ref={newTagInputRef}
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
