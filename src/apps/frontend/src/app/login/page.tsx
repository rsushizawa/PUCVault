"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/");
    } catch {
      setError("Email ou senha incorretos.");
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
          <p className="text-text-muted text-sm">Entrar na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-sm">Email ou usuário</label>
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
        </form>

        <p className="text-text-muted text-sm text-center">
          Não tem uma conta?{" "}
          <Link href="/sign-in" className="text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
