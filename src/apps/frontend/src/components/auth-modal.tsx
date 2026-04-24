"use client";

import Link from "next/link";
import { X } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-raised rounded-2xl p-6 w-80 border border-surface-overlay shadow-2xl animate-expand-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-text-primary font-bold text-lg">Entre para publicar</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer p-0.5"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-text-muted text-sm mb-5">
          Você precisa de uma conta para criar posts, votar e comentar.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full text-center bg-accent text-surface-base font-semibold py-2.5 rounded-lg text-sm hover:opacity-90 transition-all duration-200 cursor-pointer"
            onClick={onClose}
          >
            Entrar
          </Link>
          <Link
            href="/sign-in"
            className="w-full text-center border border-accent/40 text-accent font-semibold py-2.5 rounded-lg text-sm hover:bg-accent/10 hover:border-accent/70 transition-all duration-200 cursor-pointer"
            onClick={onClose}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
