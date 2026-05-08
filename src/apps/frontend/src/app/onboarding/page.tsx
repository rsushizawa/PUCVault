"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api/auth";
import { getForums, followCommunity } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";

export default function OnboardingPage() {
  const router = useRouter();
  const [forums, setForums] = useState<ForumSummary[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign-in form state (user must log in right after account creation)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const hasToken = !!localStorage.getItem("auth_token");
    if (hasToken) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    getForums()
      .then(setForums)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loggedIn]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(email, password);
      setLoggedIn(true);
    } catch {
      setLoginError("Email ou senha incorretos.");
    } finally {
      setLoginLoading(false);
    }
  }

  function toggleForum(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size === 0) {
      setError("Selecione pelo menos um vault para continuar.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await Promise.all([...selected].map((id) => followCommunity(String(id))));
      router.push("/");
    } catch {
      setError("Erro ao seguir vaults. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-surface-overlay rounded-xl border border-surface-raised p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-accent font-bold text-xl tracking-tight">PUCVault</Link>
            <p className="text-text-muted text-sm">Conta criada! Faça login para continuar.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none placeholder:text-text-muted border border-surface-overlay focus:border-accent/50"
                placeholder="seu@email.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-sm">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay focus:border-accent/50"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="bg-accent text-surface-base font-semibold text-sm py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-accent font-bold text-xl tracking-tight">PUCVault</Link>
          <h1 className="text-text-primary font-bold text-2xl">Escolha seus vaults</h1>
          <p className="text-text-muted text-sm">Selecione pelo menos um vault para seguir e começar.</p>
        </div>

        {loading ? (
          <p className="text-text-muted text-sm animate-fade-in">Carregando vaults...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {forums.map((forum) => {
              const isSelected = selected.has(forum.id);
              return (
                <button
                  key={forum.id}
                  type="button"
                  onClick={() => toggleForum(forum.id)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "border-accent bg-accent/10 text-text-primary"
                      : "border-surface-overlay bg-surface-raised text-text-secondary hover:border-accent/40"
                  }`}
                >
                  <span className="font-semibold text-sm">{forum.nome}</span>
                  {forum.descricao && (
                    <span className="text-xs text-text-muted line-clamp-2">{forum.descricao}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex items-center justify-between">
          <span className="text-text-muted text-sm">
            {selected.size} selecionado{selected.size !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving || selected.size === 0}
            className="bg-accent text-surface-base font-semibold text-sm px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? "Salvando..." : "Continuar →"}
          </button>
        </div>
      </div>
    </div>
  );
}
