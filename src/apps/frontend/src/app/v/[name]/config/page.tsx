"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import { getForumByName, updateForumDescription } from "@/lib/api/communities";
import { Cargo, isAtLeast } from "@/types/cargo";
import type { ForumSummary } from "@/lib/api/communities";
import { getMe } from "@/lib/api/auth";
import { ArrowLeft } from "lucide-react";

export default function ForumConfigPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const router = useRouter();

  const [forum, setForum] = useState<ForumSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) {
      router.replace("/login");
      return;
    }
    Promise.all([getMe(), getForumByName(decodedName)])
      .then(([user, forum]) => {
        const elevated = isAtLeast(user.cargo ?? "", Cargo.ADMIN);
        const isCreator = forum.criador === Number(user.id);
        if (!elevated && !isCreator) { router.replace(`/v/${name}`); return; }
        setForum(forum);
        setDescricao(forum.descricao ?? "");
      })
      .catch(() => router.replace(`/v/${name}`))
      .finally(() => setLoading(false));
  }, [decodedName, name, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!forum) return;
    setSaving(true);
    setMsg(null);
    try {
      await updateForumDescription(String(forum.id), descricao);
      setMsg({ ok: true, text: "Descrição atualizada com sucesso." });
    } catch {
      setMsg({ ok: false, text: "Erro ao salvar. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-base min-h-screen flex flex-col">
        <NavBar />
        <p className="text-text-muted text-center py-16 text-sm animate-fade-in">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-base min-h-screen flex flex-col">
      <NavBar />
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/v/${name}`)}
            className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer"
          >
            <ArrowLeft size={14} />
            {decodedName}
          </button>
          <span className="text-surface-overlay">/</span>
          <h1 className="text-text-primary font-bold text-xl">Configurações do fórum</h1>
        </div>

        <section className="bg-surface-raised rounded-xl p-6 border border-surface-overlay flex flex-col gap-5">
          <h2 className="text-text-primary font-semibold">Informações gerais</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium">Nome</label>
            <p className="text-text-muted text-sm px-3 py-2 rounded-lg bg-surface-input border border-surface-overlay select-none">
              {forum?.nome}
            </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-medium">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                placeholder="Descreva o propósito deste fórum..."
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200 resize-none"
              />
            </div>

            {msg && (
              <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="self-end bg-accent text-surface-base text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
