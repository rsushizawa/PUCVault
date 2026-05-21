"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/navbar";
import CommunityHero from "@/components/community-hero";
import TabsNavigation, { Tab } from "@/components/tabs-navigation";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { CommunitySidebar } from "@/components/community-sidebar";
import CommunityFiles from "@/components/community-files";
import ForumAdminPanel from "@/components/forum-admin-panel";
import { getForumByName, getCommunityPosts, getCommunity, followCommunity, updateForumDescription } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";
import { createPost, votePost } from "@/lib/api/posts";
import { getMe } from "@/lib/api/auth";
import type { UserProfile } from "@/lib/api/auth";
import type { Post } from "@/types/api";
import type { Tag } from "@/types/tag";
import { Cargo, isAtLeast } from "@/types/cargo";

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function isElevated(cargo: string) {
  return isAtLeast(cargo, Cargo.VALIDADOR);
}

export default function VaultPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);

  const [forum, setForum] = useState<ForumSummary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [followerCount, setFollowerCount] = useState<string>("—");
  const [isFollowing, setIsFollowing] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("forum");

  // Forum config state
  const [configDescricao, setConfigDescricao] = useState("");
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Posts + pagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch current user silently
  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    getForumByName(decodedName)
      .then((f) => {
        setForum(f);
        setConfigDescricao(f.descricao ?? "");
        return getCommunity(String(f.id));
      })
      .then((extended) => {
        setFollowerCount(extended.seguidores ?? "0");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const us: any = extended.user_status;
        setIsFollowing(us === "1" || us === 1 || us === true);
      })
      .catch(() => setNotFound(true));
  }, [decodedName]);

  // Initial post load
  useEffect(() => {
    if (!forum) return;
    setPostsLoading(true);
    getCommunityPosts(String(forum.id), 1)
      .then(({ posts: p, total: t }) => {
        setPosts(p);
        setTotal(t);
        pageRef.current = 1;
      })
      .catch(() => setPostsError("Erro ao carregar posts."))
      .finally(() => setPostsLoading(false));
  }, [forum?.id]);

  const loadMoreFnRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    loadMoreFnRef.current = async () => {
      if (!forum || loadingMoreRef.current || posts.length >= total) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      try {
        const { posts: newPosts, total: t } = await getCommunityPosts(String(forum.id), nextPage);
        setPosts((prev) => [...prev, ...newPosts]);
        setTotal(t);
        pageRef.current = nextPage;
      } catch {
        // silently ignore
      } finally {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    };
  }, [forum, posts.length, total]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMoreFnRef.current(); },
      { threshold: 0.1 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  async function handleFollow() {
    if (!forum) return;
    try {
      await followCommunity(String(forum.id));
      setIsFollowing((prev) => !prev);
      setFollowerCount((prev) => {
        const n = Number(prev);
        return String(isFollowing ? Math.max(0, n - 1) : n + 1);
      });
    } catch {
      // silently ignore
    }
  }

  async function handleSaveForumConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!forum) return;
    setConfigSaving(true);
    setConfigMsg(null);
    try {
      await updateForumDescription(String(forum.id), configDescricao);
      setConfigMsg({ ok: true, text: "Descrição atualizada com sucesso." });
      setForum((prev) => prev ? { ...prev, descricao: configDescricao } : prev);
    } catch {
      setConfigMsg({ ok: false, text: "Erro ao salvar. Tente novamente." });
    } finally {
      setConfigSaving(false);
    }
  }

  async function handlePost(data: { title: string; content: string; tags: Tag[]; file?: File }) {
    if (!forum) return;
    await createPost(String(forum.id), {
      title: data.title,
      content: data.content,
      tags: data.tags.map((t) => t.id),
      file: data.file,
    });
    const { posts: p, total: t } = await getCommunityPosts(String(forum.id), 1);
    setPosts(p);
    setTotal(t);
    pageRef.current = 1;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <NavBar />
        <p className="text-text-muted text-center py-24 text-sm">Vault não encontrado.</p>
      </div>
    );
  }

  const elevated = user ? isElevated(user.cargo ?? "") : false;
  const isCreator = user && forum ? forum.criador === Number(user.id) : false;
  const showMod = elevated;
  const showConfig = !!(user && (isCreator || isAtLeast(user.cargo ?? "", Cargo.ADMIN)));
  const hasMore = posts.length < total;

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <CommunityHero
        communityName={forum?.nome ?? ""}
        memberCount={followerCount}
        repositoryType="Público"
        isFollowing={isFollowing}
        onFollow={user ? handleFollow : undefined}
      />
      <TabsNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showMod={showMod}
        showConfig={showConfig}
      />

      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-6 items-start">
          <div className="flex flex-col gap-4">
            {activeTab === "forum" && (
              <>
                <CreatePost forumId={String(forum?.id ?? "")} onPost={handlePost} />

                {postsLoading && (
                  <p className="text-text-muted text-sm animate-fade-in py-4">Carregando posts...</p>
                )}
                {postsError && (
                  <p className="text-sm text-red-400">{postsError}</p>
                )}

                {!postsLoading && posts.length > 0 && (
                  <div className="divide-y divide-surface-overlay">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        postId={String(post.id)}
                        communitySlug={decodedName}
                        forumId={forum ? String(forum.id) : undefined}
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

                <div ref={sentinelRef} className="py-2 flex justify-center">
                  {loadingMore && (
                    <span className="text-text-muted text-xs animate-fade-in">Carregando mais...</span>
                  )}
                  {!hasMore && !postsLoading && posts.length > 0 && (
                    <span className="text-text-muted text-xs">Você viu todos os posts.</span>
                  )}
                </div>
              </>
            )}

            {activeTab === "arquivos" && (
              <CommunityFiles forumId={String(forum?.id ?? "")} />
            )}

            {activeTab === "moderação" && forum && user && (
              <ForumAdminPanel
                forum={forum}
                userCargo={user.cargo ?? ""}
              />
            )}

            {activeTab === "config" && forum && (
              <section className="bg-surface-raised rounded-xl p-6 border border-surface-overlay flex flex-col gap-5 max-w-2xl">
                <h2 className="text-text-primary font-semibold">Configurações do fórum</h2>

                <div className="flex flex-col gap-1.5">
                  <label className="text-text-secondary text-xs font-medium">Nome</label>
                  <p className="text-text-muted text-sm px-3 py-2 rounded-lg bg-surface-input border border-surface-overlay select-none">
                    {forum.nome}
                  </p>
                </div>

                <form onSubmit={handleSaveForumConfig} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary text-xs font-medium">Descrição</label>
                    <textarea
                      value={configDescricao}
                      onChange={(e) => setConfigDescricao(e.target.value)}
                      rows={4}
                      placeholder="Descreva o propósito deste fórum..."
                      className="bg-surface-input text-text-primary text-sm px-3 py-2 rounded-lg outline-none border border-surface-overlay hover:border-accent/30 focus:border-accent/50 placeholder:text-text-muted transition-all duration-200 resize-none"
                    />
                  </div>

                  {configMsg && (
                    <p className={`text-sm ${configMsg.ok ? "text-green-400" : "text-red-400"}`}>
                      {configMsg.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={configSaving}
                    className="self-end bg-accent text-surface-base text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {configSaving ? "Salvando..." : "Salvar"}
                  </button>
                </form>
              </section>
            )}
          </div>

          <div className="hidden lg:block">
            <CommunitySidebar
              communityName={forum?.nome ?? ""}
              createdAt={forum ? new Date(forum.criado_em).toLocaleDateString("pt-BR") : ""}
              isPublic={true}
              memberCount="—"
              memberLabel="Membros"
              postCount={String(total)}
              postLabel="Posts"
              rules={[
                { id: 1, title: "Seja respeitoso", description: "Trate os outros com respeito." },
                { id: 2, title: "Sem plágio", description: "Sempre cite as fontes." },
                { id: 3, title: "Fique no tema", description: "Mantenha posts relevantes." },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
