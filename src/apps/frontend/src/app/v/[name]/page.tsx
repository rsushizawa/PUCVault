"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/navbar";
import CommunityHero from "@/components/community-hero";
import TabsNavigation, { Tab } from "@/components/tabs-navigation";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { CommunitySidebar } from "@/components/community-sidebar";
import CommunityFiles, { Semester } from "@/components/community-files";
import { getForums, getCommunityPosts, getCommunityFiles } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";
import { createPost, votePost } from "@/lib/api/posts";
import type { Post } from "@/types/api";

const PAGE_SIZE = 20;

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function VaultPage() {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name);

  const [forum, setForum] = useState<ForumSummary | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("forum");

  // Posts + pagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Files
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);

  // Resolve forum name → data
  useEffect(() => {
    getForums()
      .then((forums) => {
        const match = forums.find(
          (f) => f.nome.toLowerCase() === decodedName.toLowerCase(),
        );
        if (!match) { setNotFound(true); return; }
        setForum(match);
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

    getCommunityFiles(String(forum.id), "default")
      .then(setSemesters)
      .catch(() => setFilesError("Erro ao carregar arquivos."))
      .finally(() => setFilesLoading(false));
  }, [forum?.id]);

  // Keep a stable ref to the load-more logic so the observer never goes stale
  const loadMoreFnRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    loadMoreFnRef.current = async () => {
      if (!forum || loadingMoreRef.current || posts.length >= total) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      try {
        const { posts: newPosts, total: t } = await getCommunityPosts(
          String(forum.id),
          nextPage,
        );
        setPosts((prev) => [...prev, ...newPosts]);
        setTotal(t);
        pageRef.current = nextPage;
      } catch {
        // silently ignore load-more errors
      } finally {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    };
  }, [forum, posts.length, total]);

  // Intersection observer — set up once
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

  // Handle new post submission
  async function handlePost(data: { title: string; content: string; tags: string[] }) {
    if (!forum) return;
    try {
      await createPost(String(forum.id), {
        title: data.title,
        content: data.content,
        tags: [], // tag name→ID resolution pending
      });
      // Refetch page 1 so the new post appears with a proper id from the DB
      const { posts: p, total: t } = await getCommunityPosts(String(forum.id), 1);
      setPosts(p);
      setTotal(t);
      pageRef.current = 1;
    } catch {
      // TODO: surface error to user
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <NavBar />
        <p className="text-text-muted text-center py-24 text-sm">Vault não encontrado.</p>
      </div>
    );
  }

  const hasMore = posts.length < total;

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <CommunityHero
        communityName={forum?.nome ?? ""}
        memberCount="—"
        repositoryType="Público"
      />
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-4">
            {activeTab === "forum" && (
              <>
                <CreatePost
                  onPost={handlePost}
                  availableTags={["question", "resource", "discussion"]}
                />

                {postsLoading && (
                  <p className="text-text-muted text-sm animate-fade-in py-4">
                    Carregando posts...
                  </p>
                )}
                {postsError && <p className="text-sm text-red-400">{postsError}</p>}

                {!postsLoading && posts.length > 0 && (
                  <div className="divide-y divide-surface-overlay">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        postId={post.id}
                        communitySlug={decodedName}
                        title={post.title}
                        body={post.body}
                        author={`u/${post.author?.username ?? "[deletado]"}`}
                        timestamp={formatTimestamp(post.createdAt)}
                        tags={post.tags}
                        voteCount={post.voteCount}
                        commentCount={post.commentCount}
                        onUpvote={() => votePost(post.id, 1).catch(() => {})}
                        onDownvote={() => votePost(post.id, -1).catch(() => {})}
                      />
                    ))}
                  </div>
                )}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="py-2 flex justify-center">
                  {loadingMore && (
                    <span className="text-text-muted text-xs animate-fade-in">
                      Carregando mais...
                    </span>
                  )}
                  {!hasMore && !postsLoading && posts.length > 0 && (
                    <span className="text-text-muted text-xs">
                      Você viu todos os posts.
                    </span>
                  )}
                </div>
              </>
            )}

            {activeTab === "arquivos" && (
              <>
                {filesLoading && <p className="text-text-muted text-sm">Carregando arquivos...</p>}
                {filesError && <p className="text-sm text-red-400">{filesError}</p>}
                {!filesLoading && !filesError && <CommunityFiles semesters={semesters} />}
              </>
            )}
          </div>

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
  );
}
