"use client";

import { useState, useRef, useCallback } from "react";
import { User, Flag, UserPlus, UserCheck, Calendar, Users } from "lucide-react";
import { getUserByUsername, followUser, checkForumFollow, isFollowingUser } from "@/lib/api/users";
import { useCurrentUser } from "@/context/current-user-context";
import DenunciaModal from "@/components/denuncia-modal";
import type { UserInfo } from "@/lib/api/users";

function accountAge(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(ms / 86400000);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}m`;
  return `${Math.floor(months / 12)}a`;
}

interface UserHoverCardProps {
  username: string;
  userId: string;
  forumId?: string;
  children: React.ReactNode;
}

export default function UserHoverCard({ username, userId, forumId, children }: UserHoverCardProps) {
  const { user: me } = useCurrentUser();

  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<UserInfo | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [followsThisForum, setFollowsThisForum] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetched = useRef(false);

  const fetchData = useCallback(() => {
    if (fetched.current || !username) return;
    fetched.current = true;

    const fetchUser = getUserByUsername(username);
    const fetchFollow = me ? isFollowingUser(userId).catch(() => ({ follows: false })) : Promise.resolve({ follows: false });
    const fetchForumFollow = (forumId && userId)
      ? checkForumFollow(userId, forumId).catch(() => ({ follows: false }))
      : Promise.resolve({ follows: false });

    Promise.all([fetchUser, fetchFollow, fetchForumFollow])
      .then(([userInfo, followState, forumFollowState]) => {
        setInfo(userInfo);
        setIsFollowing(followState.follows);
        setFollowsThisForum(forumFollowState.follows);
      })
      .catch(() => {});
  }, [username, userId, forumId, me]);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    enterTimer.current = setTimeout(() => {
      setOpen(true);
      fetchData();
    }, 300);
  }, [fetchData]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    leaveTimer.current = setTimeout(() => setOpen(false), 200);
  }, []);

  async function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    if (!info) return;
    setFollowLoading(true);
    try {
      await followUser(String(info.id));
      setIsFollowing((prev) => !prev);
    } catch {
      // silently ignore
    } finally {
      setFollowLoading(false);
    }
  }

  const resolvedId = info?.id ?? userId;
  const isSelf = me && info ? String(me.id) === String(info.id) : false;

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
        onClick={(e) => e.stopPropagation()}
      >
        {children}

        {open && (
          <div
            className="absolute left-0 top-full mt-1 z-50 w-64 bg-surface-raised border border-surface-overlay rounded-xl shadow-2xl p-3 flex flex-col gap-2.5 animate-fade-in"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Avatar + name */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-surface-overlay border border-accent/20 flex items-center justify-center overflow-hidden shrink-0">
                {info?.img_perfil ? (
                  <img src={info.img_perfil} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-text-muted" />
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

            {/* Cargo badge */}
            {info?.cargo && info.cargo !== "USUARIO" && (
              <span className="self-start text-[10px] font-semibold px-1.5 py-px rounded bg-accent/10 text-accent border border-accent/20">
                {info.cargo}
              </span>
            )}

            {/* Stats */}
            {info && (
              <div className="flex items-center gap-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {info.seguidores ?? "0"} seguidores
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {accountAge(info.criado_em)}
                </span>
              </div>
            )}

            {/* Forum follow indicator */}
            {forumId && info && (
              <div className="text-[11px]">
                {followsThisForum
                  ? <span className="text-accent font-medium">Segue este fórum</span>
                  : <span className="text-text-muted">Não segue este fórum</span>
                }
              </div>
            )}

            <div className="border-t border-surface-overlay pt-2 flex items-center justify-between gap-2">
              {me && !isSelf && (
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-50"
                  style={isFollowing
                    ? { borderColor: "var(--color-surface-overlay)", color: "var(--color-text-muted)" }
                    : { borderColor: "var(--color-accent)", color: "var(--color-accent)", background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }
                  }
                >
                  {isFollowing ? <UserCheck size={11} /> : <UserPlus size={11} />}
                  {isFollowing ? "Seguindo" : "Seguir"}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); setReportOpen(true); }}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors cursor-pointer ml-auto"
              >
                <Flag size={11} />
                Denunciar
              </button>
            </div>
          </div>
        )}
      </span>
    </>
  );
}
