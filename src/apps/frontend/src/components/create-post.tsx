"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import MarkdownEditor from "@/components/markdown-editor";
import AuthModal from "@/components/auth-modal";
import { getTagColor } from "@/lib/tag-colors";

interface CreatePostProps {
  onPost: (data: { title: string; content: string; tags: string[] }) => void;
  availableTags?: string[];
}

export default function CreatePost({
  onPost,
  availableTags = ["question", "resource", "discussion"],
}: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notifyOnReply, setNotifyOnReply] = useState(false);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const allTags = [...availableTags, ...pendingTags];

  function handleExpandClick() {
    if (!localStorage.getItem("auth_token")) {
      setShowAuthModal(true);
    } else {
      setIsExpanded(true);
    }
  }

  function handlePost() {
    if (!title.trim()) return;
    onPost({ title: title.trim(), content, tags: selectedTags });
    reset();
  }

  function handleCancel() {
    reset();
  }

  function reset() {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setIsExpanded(false);
    setNotifyOnReply(false);
    setPendingTags([]);
    setIsAddingTag(false);
    setNewTagInput("");
  }

  function handleConfirmNewTag() {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !allTags.includes(trimmed)) {
      setPendingTags([...pendingTags, trimmed]);
      setSelectedTags([...selectedTags, trimmed]);
    }
    setNewTagInput("");
    setIsAddingTag(false);
  }

  function handleNewTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleConfirmNewTag();
    if (e.key === "Escape") { setNewTagInput(""); setIsAddingTag(false); }
  }

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const hasPendingSelected = selectedTags.some((t) => pendingTags.includes(t));

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {!isExpanded ? (
        <div className="bg-surface-raised px-4 py-3 rounded-xl border border-accent/10 hover:border-accent/25 transition-all duration-200">
          <div
            role="button"
            tabIndex={0}
            onClick={handleExpandClick}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleExpandClick(); }}
            className="bg-surface-input w-full px-4 py-2.5 rounded-lg text-sm text-text-muted cursor-pointer hover:bg-surface-overlay transition-colors duration-150 select-none"
          >
            Faça uma pergunta ou compartilhe um insight...
          </div>
        </div>
      ) : (
        <div className="bg-surface-raised p-5 rounded-xl flex flex-col gap-4 border border-accent/20 animate-expand-in">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do post"
            className="w-full bg-surface-input text-text-primary text-base font-medium px-4 py-2.5 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200"
          />

          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Detalhe sua pergunta ou insight..."
            minHeight="160px"
          />

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Tags</span>
            <div className="flex gap-2 items-center flex-wrap">
              {allTags.map((tag) => {
                const isPending = pendingTags.includes(tag);
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleTagToggle(tag)}
                    className={`flex items-center gap-1.5 font-semibold text-sm px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                      isPending
                        ? "border border-dashed border-text-muted/40 bg-surface-overlay"
                        : isSelected
                          ? "border border-current bg-surface-overlay"
                          : "border border-transparent bg-surface-overlay hover:border-current/40"
                    } ${isSelected ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
                    style={{ color: getTagColor(tag) }}
                    title={isPending ? "Aguardando aprovação" : undefined}
                  >
                    {isPending && <Clock size={11} className="shrink-0" />}
                    {tag}
                  </button>
                );
              })}

              {isAddingTag ? (
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleNewTagKeyDown}
                  onBlur={handleConfirmNewTag}
                  placeholder="nova tag"
                  aria-label="Nova tag"
                  className="rounded-full border border-accent/40 bg-surface-input px-4 py-1.5 text-sm text-text-secondary placeholder:text-text-muted outline-none w-32 focus:border-accent/70 transition-colors"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  aria-label="Adicionar tag"
                  onClick={() => setIsAddingTag(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-overlay border border-accent/20 hover:border-accent/50 hover:bg-accent/10 text-accent transition-all duration-150 cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {hasPendingSelected && (
              <p className="text-text-muted text-xs flex items-center gap-1.5">
                <Clock size={11} />
                Tags novas precisam de aprovação antes de aparecerem para todos.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyOnReply}
                onChange={(e) => setNotifyOnReply(e.target.checked)}
                className="rounded w-4 h-4 cursor-pointer accent-accent"
              />
              Notificar sobre respostas
            </label>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm text-text-secondary border border-surface-overlay hover:border-accent/30 hover:text-text-primary transition-all duration-150 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePost}
              disabled={!title.trim()}
              className="px-5 py-2 rounded-lg text-sm bg-accent text-surface-base font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Publicar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
