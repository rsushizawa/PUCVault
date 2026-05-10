"use client";

import { useState, useRef, useCallback } from "react";
import { User, Flag } from "lucide-react";
import { getUserByUsername } from "@/lib/api/users";
import DenunciaModal from "@/components/denuncia-modal";
import type { UserInfo } from "@/lib/api/users";

interface UserHoverCardProps {
  username: string;
  userId: string;
  children: React.ReactNode;
}

export default function UserHoverCard({ username, userId, children }: UserHoverCardProps) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    enterTimer.current = setTimeout(() => {
      setOpen(true);
      if (!info && username) {
        getUserByUsername(username)
          .then((r) => setInfo(r))
          .catch(() => {});
      }
    }, 300);
  }, [username, info]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    leaveTimer.current = setTimeout(() => setOpen(false), 200);
  }, []);

  const resolvedId = info?.id ?? userId;

  return (
    <>
      {reportOpen && resolvedId && (
        <DenunciaModal
          type="usuario"
          targetId={Number(resolvedId)}
          targetLabel={`u/${username}`}
          onClose={() => setReportOpen(false)}
        />
      )}

      <span
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}

        {open && (
          <div
            className="absolute left-0 top-full mt-1 z-50 w-56 bg-surface-raised border border-surface-overlay rounded-xl shadow-2xl p-3 flex flex-col gap-2 animate-fade-in"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-surface-overlay border border-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                {info?.img_perfil ? (
                  <img src={info.img_perfil} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={15} className="text-text-muted" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-text-primary text-sm font-semibold truncate">
                  u/{username}
                </span>
                {info?.nome && (
                  <span className="text-text-muted text-xs truncate">{info.nome}</span>
                )}
              </div>
            </div>

            {info?.cargo && info.cargo !== "USUARIO" && (
              <span className="self-start text-[10px] font-semibold px-1.5 py-px rounded bg-accent/10 text-accent border border-accent/20">
                {info.cargo}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); setReportOpen(true); }}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors mt-1 cursor-pointer"
            >
              <Flag size={11} />
              Denunciar usuário
            </button>
          </div>
        )}
      </span>
    </>
  );
}
