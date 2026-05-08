"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import MarkdownBody from "@/components/markdown-body";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors duration-100 cursor-pointer"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-surface-overlay mx-1 shrink-0" />;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escreva algo...",
  minHeight = "180px",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function applyInlineFormat(before: string, after = before, ph = "") {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value: v } = el;
    const selected = v.slice(s, e) || ph;
    onChange(v.slice(0, s) + before + selected + after + v.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + selected.length);
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
      el.setSelectionRange(selectionStart + prefix.length, selectionStart + prefix.length);
    });
  }

  return (
    <div className="bg-surface-input rounded-xl overflow-hidden border border-surface-overlay focus-within:border-accent/30 transition-colors duration-200">
      {/* Mobile tab switcher */}
      <div className="flex sm:hidden border-b border-surface-overlay">
        <button
          type="button"
          onClick={() => setMobileTab("write")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            mobileTab === "write"
              ? "text-accent border-b-2 border-accent"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Escrever
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            mobileTab === "preview"
              ? "text-accent border-b-2 border-accent"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Visualizar
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-surface-overlay bg-surface-raised flex-wrap">
        <ToolbarBtn label="Negrito" onClick={() => applyInlineFormat("**", "**", "texto")}>
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Itálico" onClick={() => applyInlineFormat("*", "*", "texto")}>
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Link" onClick={() => applyInlineFormat("[", "](url)", "texto")}>
          <Link size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Tachado" onClick={() => applyInlineFormat("~~", "~~", "texto")}>
          <Strikethrough size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Código" onClick={() => applyInlineFormat("`", "`", "código")}>
          <Code size={14} />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn label="Lista" onClick={() => applyLinePrefix("- ")}>
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Lista numerada" onClick={() => applyLinePrefix("1. ")}>
          <ListOrdered size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Citação" onClick={() => applyLinePrefix("> ")}>
          <Quote size={14} />
        </ToolbarBtn>
        <Divider />
        <ToolbarBtn label="Imagem" onClick={() => applyInlineFormat("![", "](url)", "alt")}>
          <Image size={14} />
        </ToolbarBtn>
      </div>

      {/* Side-by-side panes (desktop) / single tab pane (mobile) */}
      <div className="flex sm:flex-row sm:divide-x divide-surface-overlay">
        {/* Editor pane */}
        <div className={`flex-1 flex flex-col min-w-0 ${mobileTab === "preview" ? "hidden sm:flex" : "flex"}`}>
          <span className="hidden sm:block px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted select-none">
            Escrever
          </span>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full px-3 py-3 text-sm text-text-secondary placeholder:text-text-muted outline-none resize-none bg-transparent"
          />
        </div>

        {/* Preview pane */}
        <div className={`flex-1 flex flex-col min-w-0 sm:border-l border-surface-overlay ${mobileTab === "write" ? "hidden sm:flex" : "flex"}`}>
          <span className="hidden sm:block px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted select-none">
            Visualizar
          </span>
          <div className="flex-1 px-3 pb-3 pt-3 sm:pt-0 overflow-auto" style={{ minHeight }}>
            {value.trim() ? (
              <MarkdownBody>{value}</MarkdownBody>
            ) : (
              <p className="text-text-muted text-sm italic">Nada para visualizar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
