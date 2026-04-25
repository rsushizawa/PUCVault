"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import MarkdownEditor from "@/components/markdown-editor";
import AuthModal from "@/components/auth-modal";
import { getTagColor } from "@/lib/tag-colors";
import { getForumTags, searchTags } from "@/lib/api/tags";
import type { Tag } from "@/types/tag";

interface CreatePostProps {
  forumId: string;
  onPost: (data: { title: string; content: string; tags: Tag[] }) => void;
}

export default function CreatePost({ forumId, onPost }: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [fetchedTags, setFetchedTags] = useState<Tag[]>([]);
  const [tagMenuLoading, setTagMenuLoading] = useState(false);

  useEffect(() => {
    if (!tagMenuOpen) return;
    let cancelled = false;
    const load = async () => {
      setTagMenuLoading(true);
      try {
        const result =
          tagSearch.length >= 2
            ? await searchTags(tagSearch, forumId)
            : await getForumTags(forumId);
        if (!cancelled) setFetchedTags(result);
      } catch {
        if (!cancelled) setFetchedTags([]);
      } finally {
        if (!cancelled) setTagMenuLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [tagSearch, tagMenuOpen, forumId]);

  function handleExpandClick() {
    if (!localStorage.getItem("auth_token")) {
      setShowAuthModal(true);
    } else {
      setIsExpanded(true);
    }
  }

  function handlePost() {
    if (!title.trim()) return;
    const resolvedTags = selectedTags
      .map((name) => fetchedTags.find((t) => t.name === name))
      .filter((t): t is Tag => t !== undefined);
    onPost({ title: title.trim(), content, tags: resolvedTags });
    reset();
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
    setFetchedTags([]);
    setIsExpanded(false);
  }

  function handleTagToggle(tagName: string) {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  }

  const allDisplayTags = fetchedTags.map((t) => ({ name: t.name, id: t.id }));

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
              {allDisplayTags.map(({ name, id }) => {
                const isSelected = selectedTags.includes(name);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleTagToggle(name)}
                    className={`flex items-center gap-1.5 font-semibold text-sm px-3.5 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border border-current bg-surface-overlay"
                        : "border border-transparent bg-surface-overlay hover:border-current/40"
                    } ${isSelected ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
                    style={{ color: getTagColor(id) }}
                  >
                    {name}
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
                      ) : fetchedTags.length === 0 ? (
                        <p className="text-xs text-text-muted px-3 py-2">Nenhuma tag encontrada</p>
                      ) : (
                        fetchedTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => { handleTagToggle(tag.name); setTagMenuOpen(false); setTagSearch(""); }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-surface-overlay transition-colors ${
                              selectedTags.includes(tag.name) ? "text-accent font-medium" : "text-text-secondary"
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center gap-3">
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
