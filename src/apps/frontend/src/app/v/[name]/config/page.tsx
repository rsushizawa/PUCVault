"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import { getForumByName, updateForumDescription } from "@/lib/api/communities";
import { uploadForumImage } from "@/lib/api/images";
import { Cargo, isAtLeast } from "@/types/cargo";
import type { ForumSummary } from "@/lib/api/communities";
import { getMe } from "@/lib/api/auth";
import { ArrowLeft, Camera } from "lucide-react";

export default function ForumConfigPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);
  const router = useRouter();

  const [forum, setForum] = useState<ForumSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const perfilInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [perfilUrl, setPerfilUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [perfilFile, setPerfilFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imgSaving, setImgSaving] = useState(false);
  const [imgMsg, setImgMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [canEditImages, setCanEditImages] = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getForumByName(decodedName)])
      .then(([user, forum]) => {
        const elevated = isAtLeast(user.cargo ?? "", Cargo.ADMIN);
        const isCreator = forum.criador === Number(user.id);
        if (!elevated && !isCreator) { router.replace(`/v/${name}`); return; }
        setCanEditImages(user.cargo === Cargo.SUPERADMIN);
        setForum(forum);
        setDescricao(forum.descricao ?? "");
        setPerfilUrl(forum.img_perfil ?? "");
        setBannerUrl(forum.img_banner ?? "");
      })
      .catch(() => router.replace(`/v/${name}`))
      .finally(() => setLoading(false));
  }, [decodedName, name, router]);

  async function handleSaveImages(e: React.FormEvent) {
    e.preventDefault();
    if (!forum || (!perfilFile && !bannerFile)) return;
    setImgSaving(true);
    setImgMsg(null);
    try {
      if (perfilFile) await uploadForumImage(String(forum.id), "perfil", perfilFile);
      if (bannerFile) await uploadForumImage(String(forum.id), "banner", bannerFile);
      const refreshed = await getForumByName(decodedName);
      setPerfilUrl(refreshed.img_perfil ?? "");
      setBannerUrl(refreshed.img_banner ?? "");
      setPerfilFile(null);
      setBannerFile(null);
      setImgMsg({ ok: true, text: "Imagens atualizadas com sucesso." });
    } catch {
      setImgMsg({ ok: false, text: "Erro ao salvar imagens. Tente novamente." });
    } finally {
      setImgSaving(false);
    }
  }

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

        {canEditImages && (
        <section className="bg-surface-raised rounded-xl p-6 border border-surface-overlay flex flex-col gap-5">
          <h2 className="text-text-primary font-semibold">Imagens</h2>

          <form onSubmit={handleSaveImages} className="flex flex-col gap-4">
            {/* Banner */}
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-accent/10 border border-surface-overlay">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" />
              )}
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-surface-base/80 text-text-primary text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-surface-base transition-all duration-200 cursor-pointer"
              >
                <Camera size={12} />
                Trocar banner
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBannerFile(file);
                    setBannerUrl(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center overflow-hidden shrink-0 border border-accent/20">
                  {perfilUrl ? (
                    <img src={perfilUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => perfilInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-200 cursor-pointer"
                  aria-label="Trocar foto do fórum"
                >
                  <Camera size={12} className="text-surface-base" />
                </button>
                <input
                  ref={perfilInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPerfilFile(file);
                      setPerfilUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              <p className="text-text-muted text-xs">Clique no ícone para trocar a foto do fórum</p>
            </div>

            {imgMsg && (
              <p className={`text-sm ${imgMsg.ok ? "text-green-400" : "text-red-400"}`}>{imgMsg.text}</p>
            )}

            <button
              type="submit"
              disabled={imgSaving || (!perfilFile && !bannerFile)}
              className="self-end bg-accent text-surface-base text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {imgSaving ? "Salvando..." : "Salvar imagens"}
            </button>
          </form>
        </section>
        )}

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
