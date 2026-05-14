"use client";

import { getTags, searchTags } from "@/lib/api/tags";
import { useEffect, useState } from "react";
import { Tag as TagIcon, Flag, AlertTriangle, Plus, X } from "lucide-react";
import { getForumTags, createTag, deleteForumTag } from "@/lib/api/tags";
import {
  listarDenuncias,
  resolverDenuncia,
  type Denuncia,
} from "@/lib/api/denuncias";
import type { ForumSummary } from "@/lib/api/communities";
import type { Tag } from "@/types/tag";
import { Cargo, isAtLeast } from "@/types/cargo";
import { getTagColor } from "@/lib/tag-colors";

interface ForumAdminPanelProps {
  forum: ForumSummary;
  userCargo: string;
}

export default function ForumAdminPanel({
  forum,
  userCargo,
}: ForumAdminPanelProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [deletingTag, setDeletingTag] = useState<number | null>(null);

  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [denunciasLoading, setDenunciasLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagCreateMsg, setTagCreateMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const isAdmin = isAtLeast(userCargo, Cargo.ADMIN);
  const canManageTags = isAtLeast(userCargo, Cargo.VALIDADOR);

  useEffect(() => {
    const load = async () => {
      const result = await getTags();
      setTags(result);
    };
    load();

    getForumTags(String(forum.id))
      .then(setTags)
      .catch(() => setTags([]))
      .finally(() => setTagsLoading(false));
  }, [forum.id]);

  useEffect(() => {
    if (!isAdmin) {
      setDenunciasLoading(false);
      return;
    }
    listarDenuncias()
      .then(setDenuncias)
      .catch(() => setDenuncias([]))
      .finally(() => setDenunciasLoading(false));
  }, [isAdmin]);

  async function handleDeleteTag(tag: Tag) {
    setDeletingTag(tag.id);
    try {
      await deleteForumTag(String(forum.id), tag.id);
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
    } catch {
      // stays in list
    } finally {
      setDeletingTag(null);
    }
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    setTagCreateMsg(null);
    try {
      const tag = await createTag(newTagName.trim());
      setNewTagName("");
      setTagCreateMsg({
        ok: true,
        text: `Tag "${tag.tag}" criada com sucesso.`,
      });
      setTags((prev) => [...prev, tag]);
    } catch {
      setTagCreateMsg({
        ok: false,
        text: "Erro ao criar tag. Tente novamente.",
      });
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleResolverDenuncia(id: number) {
    setResolvingId(id);
    try {
      await resolverDenuncia(id, "RESOLVIDA");
      setDenuncias((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // stays in list
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tags do fórum */}
      <section className="bg-surface-raised rounded-xl border border-surface-overlay p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TagIcon size={15} className="text-accent" />
          <h3 className="text-text-primary font-semibold text-sm">
            Tags do fórum
          </h3>
        </div>

        {tagsLoading ? (
          <p className="text-text-muted text-xs">Carregando...</p>
        ) : tags.length === 0 ? (
          <p className="text-text-muted text-xs">Nenhuma tag criada ainda.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const color = getTagColor(tag.tag);
              return (
                <div
                  key={tag.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-current bg-surface-overlay text-xs font-semibold"
                  style={{ color }}
                >
                  <span>{tag.tag}</span>
                  {canManageTags && (
                    <button
                      type="button"
                      title="Remover tag"
                      onClick={() => handleDeleteTag(tag)}
                      disabled={deletingTag === tag.id}
                      className="ml-0.5 hover:opacity-60 transition-opacity disabled:opacity-30 cursor-pointer"
                      aria-label={`Remover tag ${tag.tag}`}
                    >
                      {deletingTag === tag.id ? "…" : <X size={11} />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Criar tag — validador+ only */}
      {canManageTags && (
        <section className="bg-surface-raised rounded-xl border border-surface-overlay p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Plus size={15} className="text-accent" />
            <h3 className="text-text-primary font-semibold text-sm">
              Criar nova tag
            </h3>
          </div>

          <form onSubmit={handleCreateTag} className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nome da tag..."
              className="flex-1 bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200"
            />
            <button
              type="submit"
              disabled={creatingTag || !newTagName.trim()}
              className="shrink-0 text-sm font-semibold bg-accent text-surface-base px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {creatingTag ? "..." : "Criar"}
            </button>
          </form>

          {tagCreateMsg && (
            <p
              className={`text-xs ${tagCreateMsg.ok ? "text-green-400" : "text-red-400"}`}
            >
              {tagCreateMsg.text}
            </p>
          )}
        </section>
      )}

      {/* Denúncias — admin+ only */}
      {isAdmin && (
        <section className="bg-surface-raised rounded-xl border border-surface-overlay p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Flag size={15} className="text-red-400" />
            <h3 className="text-text-primary font-semibold text-sm">
              Denúncias pendentes
            </h3>
          </div>

          {denunciasLoading ? (
            <p className="text-text-muted text-xs">Carregando...</p>
          ) : denuncias.length === 0 ? (
            <p className="text-text-muted text-xs">
              Nenhuma denúncia pendente.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {denuncias.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start gap-3 px-3 py-2.5 bg-surface-overlay rounded-lg"
                >
                  <AlertTriangle
                    size={13}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-xs text-text-primary font-medium line-clamp-2">
                      {d.tipo.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {d.conteudo_denunciado
                        ? `Conteúdo #${d.conteudo_denunciado}`
                        : `Usuário #${d.usuario_denunciado}`}
                      {" · por "}
                      {d.denunciante}
                      {" · "}
                      {new Date(d.criado_em).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResolverDenuncia(d.id)}
                    disabled={resolvingId === d.id}
                    className="shrink-0 text-xs font-semibold text-green-400 border border-green-400/30 px-3 py-1 rounded-lg hover:bg-green-400/10 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    {resolvingId === d.id ? "..." : "Resolver"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
