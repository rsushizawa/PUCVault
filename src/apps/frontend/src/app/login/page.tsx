"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, verifyLogin, VerifyLoginError } from "@/lib/api/auth";
import { useCurrentUser } from "@/context/current-user-context";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useCurrentUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [twoFacToken, setTwoFacToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.twoFacToken) {
        setTwoFacToken(result.twoFacToken);
      } else {
        refresh();
        router.push("/");
      }
    } catch {
      setError("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePin(e: React.FormEvent) {
    e.preventDefault();
    if (!twoFacToken) return;
    setError(null);
    setLoading(true);
    try {
      await verifyLogin(twoFacToken, pin);
      refresh();
      router.push("/");
    } catch (err) {
      if (err instanceof VerifyLoginError && err.expired) {
        setTwoFacToken(null);
        setPin("");
        setError("O código expirou. Entre novamente.");
      } else {
        setError("PIN incorreto.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-overlay rounded-sm border border-surface-raised p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-accent font-bold text-xl tracking-tight">
            PUCVault
          </Link>
          <p className="text-text-muted text-sm">
            {twoFacToken ? "Verificação em duas etapas" : "Entrar na sua conta"}
          </p>
        </div>

        {!twoFacToken ? (
          <form onSubmit={handleCredentials} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">
                Email ou usuário
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none placeholder:text-text-muted"
                placeholder="seu@email.com ou seunome"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-surface-raised font-medium text-sm py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <Link
              href="/forgot-password"
              className="text-text-muted text-sm text-center hover:text-text-secondary transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </form>
        ) : (
          <form onSubmit={handlePin} className="flex flex-col gap-4">
            <p className="text-text-secondary text-sm">
              Um código foi enviado para o seu email. Insira-o abaixo.
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

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || pin.length !== 6}
              className="bg-accent text-surface-raised font-medium text-sm py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>

            <button
              type="button"
              onClick={() => { setTwoFacToken(null); setPin(""); setError(null); }}
              className="text-text-muted text-sm hover:text-text-secondary transition-colors"
            >
              Voltar
            </button>
          </form>
        )}

        {!twoFacToken && (
          <p className="text-text-muted text-sm text-center">
            Não tem uma conta?{" "}
            <Link href="/sign-in" className="text-accent hover:underline">
              Criar conta
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
