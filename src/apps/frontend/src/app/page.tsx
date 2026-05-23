// TODO: (FE-SC-1 Step 3): Convert this file to an async server component:
//   1. Delete "use client" below.
//   2. Change `export default function Home()` to `export default async function Home()`.
//   3. Check auth: import { cookies } from 'next/headers'; const isLoggedIn = !!cookies().get('auth_token');
//   4. Fetch forums: const forums = await serverFetch<ForumSummary[]>('/forum') — import serverFetch from '@/lib/api/server'.
//   5. Fetch first feed page if isLoggedIn: const { data: posts, total } = await serverFetch<...>('/post/feed?page=1').
//   6. Render <FeedClient initialPosts={posts} initialTotal={total} isLoggedIn={isLoggedIn} forums={forums} />.
"use client";

// TODO: (FE-SC-1 Step 3): Delete this import — useState, useEffect, useRef are not used in server components.
// TODO: (FE-SC-1 Step 4): Create src/components/feed-client.tsx ("use client"). Move all state, useEffect, useRef,
//   intersection observer, and vote logic there. Props interface:
//   { initialPosts: Post[]; initialTotal: number; isLoggedIn: boolean; forums: ForumSummary[] }
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import NavBar from "@/components/navbar";
import PostCard from "@/components/post-card";
// TODO: (FE-SC-1 Step 3): Delete this import — forums are fetched server-side via serverFetch('/forum').
//   Keep `import type { ForumSummary }` if needed for prop typing on FeedClient.
import { getForums } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";
// TODO: (FE-SC-1 Step 4): Delete this import. getFeed moves to the server component (serverFetch('/post/feed?page=1')).
//   votePost moves to FeedClient — it's a user action and must stay in a client component.
import { getFeed, votePost } from "@/lib/api/posts";
import { getMe } from "@/lib/api/auth";
import type { Post } from "@/types/api";

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [forums, setForums] = useState<ForumSummary[]>([]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreFnRef = useRef<() => Promise<void>>(async () => {});

  // TODO: (FE-SC-1 Step 3): Delete this entire useEffect block (lines below through the closing `}, [])`).
  //   isLoggedIn, forums, and initial feed are all resolved server-side before the page renders.
  //   In the server component: const isLoggedIn = !!cookies().get('auth_token') from 'next/headers'.
  useEffect(() => {
    getForums()
      .then((f) => setForums(f.filter((x) => x.status === "ATIVO")))
      .catch(() => {});

    getMe()
      .then(() => {
        setIsLoggedIn(true);
        return getFeed(1)
          .then(({ posts: p, total: t }) => {
            setPosts(p);
            setTotal(t);
            pageRef.current = 1;
          })
          .catch(() => setFeedError("Erro ao carregar feed."));
      })
      .catch(() => setIsLoggedIn(false))
      .finally(() => setFeedLoading(false));
  }, []);

  useEffect(() => {
    loadMoreFnRef.current = async () => {
      if (!isLoggedIn || loadingMoreRef.current || posts.length >= total)
        return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
      const nextPage = pageRef.current + 1;
      try {
        const { posts: newPosts, total: t } = await getFeed(nextPage);
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
  }, [isLoggedIn, posts.length, total]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreFnRef.current();
      },
      { threshold: 0.1 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const hasMore = posts.length < total;

  return (
    <div className="bg-surface-base min-h-screen flex flex-col">
      <NavBar />

      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex gap-6">
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          {!isLoggedIn ? (
            <p className="text-text-muted text-center py-16 text-sm">
              Faça login para ver seu feed personalizado.
            </p>
          ) : feedLoading ? (
            <p className="text-text-muted text-center py-16 text-sm animate-fade-in">
              Carregando feed...
            </p>
          ) : feedError ? (
            <p className="text-sm text-red-400 text-center py-8">{feedError}</p>
          ) : posts.length === 0 ? (
            <p className="text-text-muted text-center py-16 text-sm">
              Nenhuma postagem no feed. Siga um vault para começar.
            </p>
          ) : (
            <>
              <div className="divide-y divide-surface-overlay rounded-xl overflow-hidden border border-surface-overlay">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    postId={String(post.id)}
                    communitySlug={
                      post.forum_nome ?? post.nome ?? String(post.forum)
                    }
                    forumId={String(post.forum)}
                    title={post.titulo}
                    body={post.conteudo}
                    author={`u/${post.nome_usuario}`}
                    timestamp={formatTimestamp(post.criado_em)}
                    tags={post.tags}
                    voteCount={Number(post.engajamento)}
                    commentCount={Number(post.comentarios)}
                    initialVote={post.userVote}
                    onVote={(v) =>
                      votePost(String(post.id), v).catch(() => {})
                    }
                  />
                ))}
              </div>

              <div ref={sentinelRef} className="py-2 flex justify-center">
                {loadingMore && (
                  <span className="text-text-muted text-xs animate-fade-in">
                    Carregando mais...
                  </span>
                )}
                {!hasMore && !feedLoading && posts.length > 0 && (
                  <span className="text-text-muted text-xs">
                    Você viu todos os posts.
                  </span>
                )}
              </div>
            </>
          )}
        </main>

        <aside className="w-60 shrink-0 hidden lg:block">
          <div className="bg-surface-raised rounded-xl p-4 sticky top-20 border border-surface-overlay">
            <h2 className="text-text-primary font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Vaults
            </h2>
            {forums.length === 0 ? (
              <p className="text-text-muted text-xs">Carregando...</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {forums.map((forum) => (
                  <li key={forum.id}>
                    <Link
                      href={`/v/${forum.nome}?id=${forum.id}`}
                      className="flex items-center gap-2 text-text-secondary hover:text-accent text-sm py-1.5 px-2 rounded-lg hover:bg-surface-overlay transition-all duration-150 cursor-pointer group"
                    >
                      <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-[9px] font-bold text-accent group-hover:bg-accent/25 transition-all">
                        {forum.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate">{forum.nome}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
