"use client";

import { useState } from "react";
import { X, Flag } from "lucide-react";
import { denunciarUsuario, denunciarConteudo } from "@/lib/api/denuncias";

interface DenunciaModalProps {
  type: "usuario" | "conteudo";
  targetId: number;
  targetLabel?: string;
  onClose: () => void;
}

export default function DenunciaModal({ type, targetId, targetLabel, onClose }: DenunciaModalProps) {
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao.trim()) return;
    setLoading(true);
    setError(false);
    try {
      if (type === "usuario") {
        await denunciarUsuario(targetId, descricao.trim());
      } else {
        await denunciarConteudo(targetId, descricao.trim());
      }
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-raised border border-surface-overlay rounded-xl w-full max-w-md shadow-2xl flex flex-col gap-5 p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={16} className="text-red-400" />
            <h2 className="text-text-primary font-semibold text-base">
              Denunciar {type === "usuario" ? "usuário" : "conteúdo"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {targetLabel && (
          <p className="text-text-muted text-xs">
            Reportando: <span className="text-text-secondary font-medium">{targetLabel}</span>
          </p>
        )}

        {done ? (
          <div className="flex flex-col gap-4 items-center py-4">
            <p className="text-green-400 text-sm font-medium">Denúncia enviada. Obrigado pelo reporte.</p>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-text-secondary border border-surface-overlay px-4 py-2 rounded-lg hover:border-accent/30 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-medium">Motivo</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo da denúncia..."
                className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs">Erro ao enviar. Tente novamente.</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary border border-surface-overlay hover:border-accent/30 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !descricao.trim()}
                className="px-5 py-2 rounded-lg text-sm bg-red-500/80 text-white font-semibold hover:bg-red-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Enviando..." : "Denunciar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
