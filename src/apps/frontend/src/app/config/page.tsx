"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import { getMe, updateMe, changePassword, toggle2FA } from "@/lib/api/auth";
import { uploadProfileImage } from "@/lib/api/images";
import { Camera, User } from "lucide-react";

export default function ConfigPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFASaving, setTwoFASaving] = useState(false);

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  useEffect(() => {
    getMe()
      .then((user) => {
        setName(user.nome ?? "");
        setUsername(user.nome_usuario ?? "");
        setAvatarUrl(user.img_perfil ?? "");
        setOriginalAvatar(user.img_perfil ?? "");
        setBannerUrl(user.img_banner ?? "");
        setTwoFAEnabled(user.a2f ?? false);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      if (avatarFile) await uploadProfileImage("perfil", avatarFile);
      if (bannerFile) await uploadProfileImage("banner", bannerFile);
      if (avatarFile || bannerFile) {
        const updated = await getMe();
        setAvatarUrl(updated.img_perfil ?? "");
        setOriginalAvatar(updated.img_perfil ?? "");
        setBannerUrl(updated.img_banner ?? "");
        setAvatarFile(null);
        setBannerFile(null);
      }
      await updateMe({
        name: name || undefined,
        username: username || undefined,
      });
      setProfileMsg({ ok: true, text: "Perfil atualizado com sucesso." });
    } catch {
      setProfileMsg({ ok: false, text: "Erro ao salvar. Tente novamente." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "As senhas não coincidem." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({
        ok: false,
        text: "A nova senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ ok: true, text: "Senha alterada com sucesso." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMsg({ ok: false, text: "Erro ao alterar senha." });
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleToggle2FA() {
    if (twoFASaving) return;
    const next = !twoFAEnabled;
    setTwoFASaving(true);
    setTwoFAEnabled(next);
    try {
      await toggle2FA();
      const updated = await getMe();
      setTwoFAEnabled(updated.a2f ?? next);
    } catch {
      setTwoFAEnabled(!next);
    } finally {
      setTwoFASaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface-base min-h-screen flex flex-col">
        <NavBar />
        <p className="text-text-muted text-center py-16 text-sm animate-fade-in">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-base min-h-screen flex flex-col">
      <NavBar />
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6 animate-fade-in">
        <h1 className="text-text-primary font-bold text-2xl">Configurações</h1>

        {/* Profile section */}
        <section className="bg-surface-raised rounded-xl p-6 border border-surface-overlay flex flex-col gap-5">
          <h2 className="text-text-primary font-semibold">Perfil</h2>

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
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={28} className="text-accent/60" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-all duration-200 cursor-pointer"
                aria-label="Trocar foto"
              >
                <Camera size={12} className="text-surface-base" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarUrl(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">
                {username || "—"}
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                Clique no ícone para trocar a foto
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nome"
                value={name}
                onChange={setName}
                placeholder="Seu nome completo"
              />
              <Field
                label="Usuário"
                value={username}
                onChange={setUsername}
                placeholder="seu_usuario"
              />
            </div>
            {profileMsg && (
              <p
                className={`text-sm ${profileMsg.ok ? "text-green-400" : "text-red-400"}`}
              >
                {profileMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="self-end bg-accent text-surface-base text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {profileSaving ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        </section>

        {/* Password section */}
        <section className="bg-surface-raised rounded-xl p-6 border border-surface-overlay flex flex-col gap-5">
          <h2 className="text-text-primary font-semibold">Alterar senha</h2>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <Field
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="••••••••"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nova senha"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="••••••••"
              />
              <Field
                label="Confirmar nova senha"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="••••••••"
              />
            </div>

            {passwordMsg && (
              <p
                className={`text-sm ${passwordMsg.ok ? "text-green-400" : "text-red-400"}`}
              >
                {passwordMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="self-end border border-accent/40 text-accent text-sm font-semibold px-5 py-2 rounded-lg hover:bg-accent/10 hover:border-accent/70 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {passwordSaving ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        </section>

        {/* Security section */}
        <section className="bg-surface-raised rounded-xl p-6 border border-surface-overlay flex flex-col gap-5">
          <h2 className="text-text-primary font-semibold">Segurança</h2>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-text-primary text-sm font-medium">
                Verificação em duas etapas (2FA)
              </p>
              <p className="text-text-muted text-xs">
                Exige um código enviado por email a cada login.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={twoFAEnabled}
              aria-label="Alternar verificação em duas etapas"
              onClick={handleToggle2FA}
              disabled={twoFASaving}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 cursor-pointer ${
                twoFAEnabled ? "bg-accent" : "bg-surface-overlay"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface-base transition-transform duration-200 ${
                  twoFAEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-secondary text-xs font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200"
      />
    </div>
  );
}
