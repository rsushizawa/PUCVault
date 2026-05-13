"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/navbar";
import PostCard from "@/components/post-card";
import {
  User,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Paperclip,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { getUserByUsername, getUserPosts, getUserFollowedForums, followUser, isFollowingUser } from "@/lib/api/users";
import { useCurrentUser } from "@/context/current-user-context";
import { votePost } from "@/lib/api/posts";
import type { User as UserType, Post, Forum } from "@/lib/api/types";

type Tab = "posts" | "forums" | "arquivos";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function accountAge(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(ms / 86400000);
  if (days < 1) return "hoje";
  if (days < 30) return `${days} dia${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months !== 1 ? "meses" : "mês"}`;
  const years = Math.floor(months / 12);
  return `${years} ano${years !== 1 ? "s" : ""}`;
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const decoded = decodeURIComponent(username);
  const { user: me } = useCurrentUser();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [forums, setForums] = useState<Forum[]>([]);
  const [forumsLoading, setForumsLoading] = useState(false);
  const [forumsError, setForumsError] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    getUserByUsername(decoded)
      .then(setProfile)
      .catch(() => setNotFound(true));
  }, [decoded]);

  useEffect(() => {
    if (!profile) return;
    setPostsLoading(true);
    const fetchPosts = getUserPosts(String(profile.id)).catch(() => [] as Post[]);
    const fetchFollow = me
      ? isFollowingUser(String(profile.id)).catch(() => ({ follows: false }))
      : Promise.resolve({ follows: false });
    Promise.all([fetchPosts, fetchFollow]).then(([p, f]) => {
      setPosts(p);
      setIsFollowing(f.follows);
    }).finally(() => setPostsLoading(false));
  }, [profile?.id, me?.id]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    if (tab === "forums" && forums.length === 0 && !forumsLoading && profile) {
      setForumsLoading(true);
      setForumsError(false);
      getUserFollowedForums(String(profile.id))
        .then(setForums)
        .catch(() => setForumsError(true))
        .finally(() => setForumsLoading(false));
    }
  }

  async function handleFollow() {
    if (!profile) return;
    setFollowLoading(true);
    try {
      await followUser(String(profile.id));
      setIsFollowing((prev) => !prev);
    } catch {
      // silently ignore
    } finally {
      setFollowLoading(false);
    }
  }

  const isSelf = !!(me && profile && String(me.id) === String(profile.id));
  const filePosts = posts.filter((p) => p.arquivo);

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <NavBar />
        <p className="text-text-muted text-center py-24 text-sm">Usuário não encontrado.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "posts", label: "Posts", icon: <FileText size={14} />, count: posts.length },
    { id: "forums", label: "Fóruns seguidos", icon: <BookOpen size={14} /> },
    { id: "arquivos", label: "Arquivos", icon: <Paperclip size={14} />, count: filePosts.length },
  ];

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />

      {/* Banner */}
      <div className="relative w-full h-36 bg-surface-overlay overflow-hidden">
        {profile?.img_banner ? (
          <img src={profile.img_banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-overlay to-surface-raised" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base/60 to-transparent" />
      </div>

      {/* Profile header */}
      <div className="px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full border-4 border-surface-base bg-surface-overlay flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
              {profile?.img_perfil ? (
                <img src={profile.img_perfil} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-text-muted" />
              )}
            </div>

            {/* Name + actions */}
            <div className="flex-1 min-w-0 pb-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-text-primary text-xl font-bold truncate">
                    u/{profile?.nome_usuario ?? decoded}
                  </h1>
                  {profile?.cargo && profile.cargo !== "USUARIO" && (
                    <span className="text-[10px] font-semibold px-1.5 py-px rounded bg-accent/10 text-accent border border-accent/20 shrink-0">
                      {profile.cargo}
                    </span>
                  )}
                </div>
                {profile?.nome && (
                  <span className="text-text-muted text-sm">{profile.nome}</span>
                )}
              </div>

              {me && !isSelf && (
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0"
                  style={isFollowing
                    ? { borderColor: "var(--color-surface-overlay)", color: "var(--color-text-muted)" }
                    : { borderColor: "var(--color-accent)", color: "var(--color-accent)", background: "color-mix(in srgb, var(--color-accent) 10%, transparent)" }
                  }
                >
                  {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
                  {isFollowing ? "Seguindo" : "Seguir"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          {profile && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                <strong className="text-text-secondary">{profile.seguidores ?? "0"}</strong> seguidores
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                <strong className="text-text-secondary">{profile.segue ?? "0"}</strong> seguindo
              </span>
              {profile.karma && (
                <span className="flex items-center gap-1.5">
                  <span className="text-accent text-xs font-bold">▲</span>
                  <strong className="text-text-secondary">{profile.karma}</strong> karma
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                Conta criada há <strong className="text-text-secondary">{accountAge(profile.criado_em)}</strong>
                <span className="text-text-muted/60">({formatDate(profile.criado_em)})</span>
              </span>
            </div>
          )}

          {profile?.descricao && (
            <p className="mt-3 text-text-muted text-sm max-w-2xl">{profile.descricao}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-surface-overlay px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 -mb-px cursor-pointer ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] bg-surface-overlay text-text-muted rounded-full px-1.5 py-px">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">

          {/* Posts tab */}
          {activeTab === "posts" && (
            <>
              {postsLoading && (
                <p className="text-text-muted text-sm animate-fade-in py-4">Carregando posts...</p>
              )}
              {!postsLoading && posts.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">Nenhum post ainda.</p>
              )}
              {!postsLoading && posts.length > 0 && (
                <div className="divide-y divide-surface-overlay">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      postId={String(post.id)}
                      communitySlug={post.forum_nome ?? post.nome ?? String(post.forum)}
                      forumId={String(post.forum)}
                      title={post.titulo}
                      body={post.conteudo}
                      author={`u/${post.nome_usuario}`}
                      authorId={String(post.criador)}
                      cargo={post.cargo || undefined}
                      timestamp={formatTimestamp(post.criado_em)}
                      tags={post.tags}
                      voteCount={Number(post.engajamento)}
                      commentCount={Number(post.comentarios)}
                      onUpvote={() => votePost(String(post.id), 1).catch(() => {})}
                      onDownvote={() => votePost(String(post.id), -1).catch(() => {})}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Forums tab */}
          {activeTab === "forums" && (
            <>
              {forumsLoading && (
                <p className="text-text-muted text-sm animate-fade-in py-4">Carregando fóruns...</p>
              )}
              {forumsError && (
                <p className="text-sm text-red-400 py-4">Não foi possível carregar os fóruns.</p>
              )}
              {!forumsLoading && !forumsError && forums.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">Nenhum fórum seguido.</p>
              )}
              {!forumsLoading && forums.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {forums.map((forum) => (
                    <Link
                      key={forum.id}
                      href={`/v/${encodeURIComponent(forum.nome)}`}
                      className="flex items-center gap-3 bg-surface-raised border border-surface-overlay rounded-xl p-3 hover:border-accent/30 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-overlay border border-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                        {forum.img_perfil ? (
                          <img src={forum.img_perfil} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={16} className="text-text-muted" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-text-primary text-sm font-semibold truncate">
                          v/{forum.nome}
                        </span>
                        {forum.descricao && (
                          <span className="text-text-muted text-xs truncate">{forum.descricao}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Files tab */}
          {activeTab === "arquivos" && (
            <>
              {postsLoading && (
                <p className="text-text-muted text-sm animate-fade-in py-4">Carregando...</p>
              )}
              {!postsLoading && filePosts.length === 0 && (
                <p className="text-text-muted text-sm py-8 text-center">Nenhum arquivo compartilhado.</p>
              )}
              {!postsLoading && filePosts.length > 0 && (
                <div className="flex flex-col gap-2">
                  {filePosts.map((post) => (
                    <a
                      key={post.id}
                      href={post.arquivo!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-surface-raised border border-surface-overlay rounded-xl px-4 py-3 hover:border-accent/30 transition-all duration-200"
                    >
                      <Paperclip size={15} className="text-accent shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-text-primary text-sm font-medium truncate">{post.titulo}</span>
                        <span className="text-text-muted text-xs">{formatTimestamp(post.criado_em)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
