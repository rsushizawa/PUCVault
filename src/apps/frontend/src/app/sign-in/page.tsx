"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/api/auth";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(form);
      router.push("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409")) {
        setError("Email ou nome de usuário já em uso.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
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
          <p className="text-text-muted text-sm">Criar uma conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-sm">Nome completo</label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              required
              minLength={3}
              autoComplete="name"
              className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none placeholder:text-text-muted"
              placeholder="Seu Nome"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-sm">Nome de usuário</label>
            <input
              type="text"
              value={form.username}
              onChange={set("username")}
              required
              minLength={3}
              maxLength={20}
              autoComplete="username"
              className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none placeholder:text-text-muted"
              placeholder="seunome"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-sm">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              autoComplete="email"
              className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-sm outline-none placeholder:text-text-muted"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-sm">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
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
            disabled={loading}
            className="bg-accent text-surface-raised font-medium text-sm py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-text-muted text-sm text-center">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
