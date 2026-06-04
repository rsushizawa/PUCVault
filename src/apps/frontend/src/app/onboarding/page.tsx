"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, verifyLogin, verifySignup, getMe, VerifyLoginError } from "@/lib/api/auth";
import { getForums, followCommunity } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";
import { useCurrentUser } from "@/context/current-user-context";

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useCurrentUser();
  const [forums, setForums] = useState<ForumSummary[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First-login flow: verify email PIN, then log in, then pick vaults.
  const [phase, setPhase] = useState<"verify" | "login">("verify");
  const [signupPin, setSignupPin] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [twoFacToken, setTwoFacToken] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    getMe()
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false));
  }, []);

  async function handleVerifySignup(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifySignup(signupPin);
      setPhase("login");
    } catch {
      setVerifyError("Código incorreto ou expirado.");
    } finally {
      setVerifying(false);
    }
  }

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
      const result = await login(email, password);
      if (result.twoFacToken) {
        setTwoFacToken(result.twoFacToken);
      } else {
        refresh();
        setLoggedIn(true);
      }
    } catch {
      setLoginError("Email ou senha incorretos.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handlePin(e: React.FormEvent) {
    e.preventDefault();
    if (!twoFacToken) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      await verifyLogin(twoFacToken, pin);
      refresh();
      setLoggedIn(true);
    } catch (err) {
      if (err instanceof VerifyLoginError && err.expired) {
        setTwoFacToken(null);
        setPin("");
        setLoginError("O código expirou. Entre novamente.");
      } else {
        setLoginError("PIN incorreto.");
      }
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
            <p className="text-text-muted text-sm">
              {phase === "verify"
                ? "Enviamos um código para o seu email. Insira-o para confirmar sua conta."
                : twoFacToken
                  ? "Um código foi enviado para o seu email. Insira-o abaixo."
                  : "Email verificado! Faça login para continuar."}
            </p>
          </div>
          {phase === "verify" ? (
            <form onSubmit={handleVerifySignup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-sm">Código de verificação</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={signupPin}
                  onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, ""))}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay focus:border-accent/50 tracking-widest"
                  placeholder="000000"
                />
              </div>
              {verifyError && <p className="text-red-400 text-sm">{verifyError}</p>}
              <button
                type="submit"
                disabled={verifying || signupPin.length !== 6}
                className="bg-accent text-surface-base font-semibold text-sm py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {verifying ? "Verificando..." : "Confirmar conta"}
              </button>
              <Link href="/sign-in" className="text-text-muted text-sm text-center hover:text-text-secondary transition-colors">
                Recomeçar cadastro
              </Link>
            </form>
          ) : twoFacToken ? (
            <form onSubmit={handlePin} className="flex flex-col gap-4">
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
                  className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay focus:border-accent/50 tracking-widest"
                  placeholder="000000"
                />
              </div>
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button
                type="submit"
                disabled={loginLoading || pin.length !== 6}
                className="bg-accent text-surface-base font-semibold text-sm py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loginLoading ? "Verificando..." : "Verificar"}
              </button>
              <button
                type="button"
                onClick={() => { setTwoFacToken(null); setPin(""); setLoginError(null); }}
                className="text-text-muted text-sm hover:text-text-secondary transition-colors"
              >
                Voltar
              </button>
            </form>
          ) : (
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
          )}
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
