"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { forgotSendEmail, forgotResetPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pinToken, setPinToken] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await forgotSendEmail(email.trim());
      setPinToken(token);
    } catch {
      setError("Não foi possível enviar o código. Verifique o email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!pinToken) return;
    if (newPassword !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotResetPassword({ pinToken, pin, newPassword });
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Código incorreto ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-overlay rounded-sm border border-surface-raised p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="text-accent font-bold text-xl tracking-tight"
          >
            PUCVault
          </Link>
          <p className="text-text-muted text-sm">
            {pinToken ? "Redefinir senha" : "Recuperar senha"}
          </p>
        </div>

        {done ? (
          <p className="text-green-400 text-sm">
            Senha redefinida com sucesso. Redirecionando para o login...
          </p>
        ) : !pinToken ? (
          <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none placeholder:text-text-muted"
                placeholder="seu@email.com"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-surface-raised font-medium text-sm py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <p className="text-text-secondary text-sm">
              Um código foi enviado para o seu email. Insira-o e escolha uma nova
              senha.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">Código PIN</label>
              <input
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                required
                maxLength={6}
                autoComplete="one-time-code"
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none tracking-widest"
                placeholder="000000"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || pin.length !== 6}
              className="bg-accent text-surface-raised font-medium text-sm py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>

            <button
              type="button"
              onClick={() => {
                setPinToken(null);
                setPin("");
                setNewPassword("");
                setConfirm("");
                setError(null);
              }}
              className="text-text-muted text-sm hover:text-text-secondary transition-colors"
            >
              Voltar
            </button>
          </form>
        )}

        {!pinToken && !done && (
          <p className="text-text-muted text-sm text-center">
            Lembrou a senha?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Entrar
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
