"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Paperclip, X } from "lucide-react";
import MarkdownEditor from "@/components/markdown-editor";
import AuthModal from "@/components/auth-modal";
import { getTagColor } from "@/lib/tag-colors";
import { getTags, searchTags } from "@/lib/api/tags";
import type { Tag } from "@/types/tag";

interface CreatePostProps {
  forumId?: string;
  mode?: "post" | "comment";
  onPost?: (data: { title: string; content: string; tags: Tag[]; file?: File }) => Promise<void>;
  onComment?: (content: string) => void;
}

export default function CreatePost({ forumId, mode = "post", onPost, onComment }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [tagMenuLoading, setTagMenuLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load initial tag list once when the form expands
  useEffect(() => {
    if (!isExpanded || availableTags.length > 0) return;
    let cancelled = false;
    const load = async () => {
      setTagMenuLoading(true);
      try {
        const result = await getTags();
        if (!cancelled) setAvailableTags(result);
      } catch {
        // leave empty
      } finally {
        if (!cancelled) setTagMenuLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isExpanded, availableTags.length]);

  // Fetch search results while the user is typing
  useEffect(() => {
    if (!tagMenuOpen || tagSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setTagMenuLoading(true);
      try {
        const result = await searchTags(tagSearch);
        if (!cancelled) setSearchResults(result);
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setTagMenuLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tagSearch, tagMenuOpen]);

  function handleExpandClick() {
    if (!localStorage.getItem("auth_token")) {
      setShowAuthModal(true);
    } else {
      setIsExpanded(true);
    }
  }

  async function handlePost() {
    if (mode === "comment") {
      if (!content.trim()) return;
      onComment?.(content.trim());
      reset();
      return;
    }

    if (!title.trim()) return;

    const resolvedTags = selectedTags
      .map((name) => availableTags.find((t) => t.tag === name))
      .filter((t): t is Tag => t !== undefined);

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onPost?.({ title: title.trim(), content, tags: resolvedTags, file: file ?? undefined });
      reset();
    } catch {
      setSubmitError("Erro ao publicar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    reset();
  }

  function reset() {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setTagMenuOpen(false);
    setTagSearch("");
    setAvailableTags([]);
    setSearchResults([]);
    setFile(null);
    setSubmitError(null);
    if (mode !== "comment") setIsExpanded(false);
  }

  function handleTagToggle(tagName: string, sourceTag?: Tag) {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
    if (sourceTag && !availableTags.some((t) => t.tag === tagName)) {
      setAvailableTags((prev) => [...prev, sourceTag]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    if (picked) setFile(picked);
    e.target.value = "";
  }

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
            {mode === "comment" ? "Adicionar um comentário..." : "Faça uma pergunta ou compartilhe um insight..."}
          </div>
        </div>
      ) : (
        <div className="bg-surface-raised p-5 rounded-xl flex flex-col gap-4 border border-accent/20 animate-expand-in">
          {/* Title — post mode only */}
          {mode === "post" && (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do post"
              className="w-full bg-surface-input text-text-primary text-base font-medium px-4 py-2.5 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200"
            />
          )}

          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder={mode === "comment" ? "Escreva um comentário..." : "Detalhe sua pergunta ou insight..."}
            minHeight={mode === "comment" ? "100px" : "160px"}
          />

          {/* Tags — post mode only */}
          {mode === "post" && (
            <div className="flex flex-col gap-2">
              <span className="text-text-muted text-xs font-medium uppercase tracking-wider">Tags</span>
              <div className="flex gap-2 items-center flex-wrap">
                {availableTags.map((t) => {
                  const isSelected = selectedTags.includes(t.tag);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleTagToggle(t.tag)}
                      className={`flex items-center gap-1.5 font-semibold text-sm px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "border border-current bg-surface-overlay"
                          : "border border-transparent bg-surface-overlay hover:border-current/40"
                      } ${isSelected ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
                      style={{ color: getTagColor(t.tag) }}
                    >
                      {t.tag}
                    </button>
                  );
                })}

                {/* Tag picker */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Adicionar tag"
                    onClick={() => setTagMenuOpen((o) => !o)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-overlay border border-accent/20 hover:border-accent/50 hover:bg-accent/10 text-accent transition-all duration-150 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>

                  {tagMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-surface-raised border border-surface-overlay rounded-lg shadow-lg z-20 flex flex-col">
                      <div className="px-3 py-2 border-b border-surface-overlay">
                        <input
                          autoFocus
                          type="text"
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") { setTagMenuOpen(false); setTagSearch(""); }
                          }}
                          placeholder="Buscar tag..."
                          className="w-full bg-surface-input text-sm text-text-primary px-2 py-1 rounded outline-none border border-surface-overlay focus:border-accent/50 placeholder:text-text-muted"
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto py-1">
                        {tagMenuLoading ? (
                          <p className="text-xs text-text-muted px-3 py-2">Carregando...</p>
                        ) : (() => {
                          const list = tagSearch.length >= 2 ? searchResults : availableTags;
                          return list.length === 0 ? (
                            <p className="text-xs text-text-muted px-3 py-2">Nenhuma tag encontrada</p>
                          ) : (
                            list.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => { handleTagToggle(tag.tag, tag); setTagMenuOpen(false); setTagSearch(""); }}
                                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-overlay transition-colors ${
                                  selectedTags.includes(tag.tag) ? "text-accent font-medium" : "text-text-secondary"
                                }`}
                              >
                                {tag.tag}
                              </button>
                            ))
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3">
            {/* File attachment — post mode only */}
            {mode === "post" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex gap-1.5 items-center">
                  {file ? (
                    <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full max-w-[160px]">
                      <Paperclip size={11} className="shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="shrink-0 hover:opacity-60 transition-opacity cursor-pointer"
                        aria-label="Remover arquivo"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                      aria-label="Anexar arquivo"
                    >
                      <Paperclip size={13} />
                      <span>Anexar</span>
                    </button>
                  )}
                </div>
              </>
            )}

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
              disabled={isSubmitting || (mode === "comment" ? !content.trim() : !title.trim())}
              className="px-5 py-2 rounded-lg text-sm bg-accent text-surface-base font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Publicando..." : mode === "comment" ? "Comentar" : "Publicar"}
            </button>
          </div>
          {submitError && (
            <p className="text-xs text-red-400 text-right">{submitError}</p>
          )}
        </div>
      )}
    </>
  );
}
