"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Link,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Image,
  Monitor,
} from "lucide-react";
import MarkdownBody from "@/components/markdown-body";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-text-secondary/40 mx-1 shrink-0" />;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "120px",
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyInlineFormat(before: string, after = before, placeholder = "") {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value: v } = el;
    const selected = v.slice(start, end) || placeholder;
    onChange(v.slice(0, start) + before + selected + after + v.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  }

  function applyLinePrefix(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, value: v } = el;
    const lineStart = v.lastIndexOf("\n", selectionStart - 1) + 1;
    onChange(v.slice(0, lineStart) + prefix + v.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        selectionStart + prefix.length,
        selectionStart + prefix.length,
      );
    });
  }

  return (
    <div className="bg-surface-input rounded-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-surface-overlay">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            tab === "write"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            tab === "preview"
              ? "text-accent border-b-2 border-accent -mb-px"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Preview
        </button>
      </div>

      {tab === "write" ? (
        <>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full px-4 pt-3 pb-2 text-sm text-text-secondary placeholder:text-text-muted outline-none resize-none bg-surface-input"
          />
          <div className="bg-surface-raised flex items-center gap-0.5 px-2 py-1.5 flex-wrap">
            <button
              type="button"
              aria-label="Bold"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyInlineFormat("**", "**", "bold text")}
            >
              <Bold size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Italic"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyInlineFormat("*", "*", "italic text")}
            >
              <Italic size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Link"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyInlineFormat("[", "](url)", "link text")}
            >
              <Link size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Strikethrough"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() =>
                applyInlineFormat("~~", "~~", "strikethrough text")
              }
            >
              <Strikethrough size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Code"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyInlineFormat("`", "`", "code")}
            >
              <Code size={15} aria-hidden />
            </button>
            <ToolbarDivider />
            <button
              type="button"
              aria-label="Bulleted list"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyLinePrefix("- ")}
            >
              <List size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Numbered list"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyLinePrefix("1. ")}
            >
              <ListOrdered size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Quote"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyLinePrefix("> ")}
            >
              <Quote size={15} aria-hidden />
            </button>
            <ToolbarDivider />
            <div className="flex-1" />
            <button
              type="button"
              aria-label="Insert image"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyInlineFormat("![", "](url)", "alt text")}
            >
              <Image size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Embed"
              className="p-2 rounded text-text-secondary hover:text-text-primary"
              onClick={() => applyInlineFormat("[embed](", ")", "url")}
            >
              <Monitor size={15} aria-hidden />
            </button>
          </div>
        </>
      ) : (
        <div className="px-4 py-3" style={{ minHeight }}>
          {value.trim() ? (
            <MarkdownBody>{value}</MarkdownBody>
          ) : (
            <p className="text-text-muted text-sm italic">
              Nothing to preview.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
