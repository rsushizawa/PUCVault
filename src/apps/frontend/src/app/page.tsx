"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import NavBar from "@/components/navbar";
import PostCard from "@/components/post-card";
import { getForums, getFollowedForums, getCommunityPosts } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";
import type { Post } from "@/types/api";

type FeedEntry = {
  forum: ForumSummary;
  topPost: Post | null;
  isFollowed: boolean;
};

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

async function buildEntries(
  forums: ForumSummary[],
  isFollowed: boolean,
): Promise<FeedEntry[]> {
  return Promise.all(
    forums.map(async (forum) => {
      try {
        const { posts } = await getCommunityPosts(String(forum.id), 1);
        return { forum, topPost: posts[0] ?? null, isFollowed };
      } catch {
        return { forum, topPost: null, isFollowed };
      }
    }),
  );
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const loggedIn = !!localStorage.getItem("auth_token");
      setIsLoggedIn(loggedIn);

      try {
        const allForums = await getForums();
        const active = allForums.filter((f) => f.status === "ATIVO");

        if (loggedIn) {
          const followed = await getFollowedForums().catch(() => [] as ForumSummary[]);
          const followedActive = followed.filter((f) => f.status === "ATIVO");
          const followedIds = new Set(followedActive.map((f) => f.id));
          const others = active.filter((f) => !followedIds.has(f.id));

          const [followedEntries, otherEntries] = await Promise.all([
            buildEntries(followedActive, true),
            buildEntries(others, false),
          ]);

          setFeed([...followedEntries, ...otherEntries]);
        } else {
          const entries = await buildEntries(active, false);
          setFeed(entries);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const followedFeed = feed.filter((e) => e.isFollowed);
  const otherFeed = feed.filter((e) => !e.isFollowed);

  return (
    <div className="bg-surface-base min-h-screen flex flex-col">
      <NavBar />

      {!isLoggedIn && (
        <section className="relative overflow-hidden border-b border-surface-overlay py-12 px-6 text-center">
          <div className="relative">
            <h1 className="text-3xl font-bold mb-2 text-accent">
              PUCVault
            </h1>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto text-sm">
              Repositório colaborativo de matérias da PUC Campinas. Encontre
              resumos, provas e discussões sobre qualquer disciplina.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/sign-in"
                className="bg-accent text-surface-base font-semibold px-5 py-2 rounded-full text-sm hover:opacity-90 transition-all duration-200 cursor-pointer"
              >
                Criar conta
              </Link>
              <Link
                href="/login"
                className="border border-accent/50 text-accent font-semibold px-5 py-2 rounded-full text-sm hover:bg-accent/10 hover:border-accent transition-all duration-200 cursor-pointer"
              >
                Entrar
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Feed */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          {loading ? (
            <p className="text-text-muted text-center py-16 text-sm animate-fade-in">
              Carregando vaults...
            </p>
          ) : feed.length === 0 ? (
            <p className="text-text-muted text-center py-16 text-sm">
              Nenhum vault disponível.
            </p>
          ) : (
            <>
              {/* Followed section */}
              {followedFeed.length > 0 && (
                <>
                  <p className="text-text-muted text-xs font-semibold uppercase tracking-widest px-1">
                    Seus vaults
                  </p>
                  {followedFeed.map(({ forum, topPost }) => (
                    <FeedCard key={forum.id} forum={forum} topPost={topPost} />
                  ))}
                </>
              )}

              {/* Separator when both sections present */}
              {followedFeed.length > 0 && otherFeed.length > 0 && (
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 border-t border-surface-overlay" />
                  <span className="text-text-muted text-xs font-semibold uppercase tracking-widest">
                    Descubra mais
                  </span>
                  <div className="flex-1 border-t border-surface-overlay" />
                </div>
              )}

              {/* Other / all vaults */}
              {otherFeed.map(({ forum, topPost }) => (
                <FeedCard key={forum.id} forum={forum} topPost={topPost} />
              ))}
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden lg:block">
          <div className="bg-surface-raised rounded-xl p-4 sticky top-20 border border-surface-overlay">
            <h2 className="text-text-primary font-semibold text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Vaults
            </h2>
            {loading ? (
              <p className="text-text-muted text-xs">Carregando...</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {feed.map(({ forum }) => (
                  <li key={forum.id}>
                    <Link
                      href={`/v/${forum.nome}`}
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

function FeedCard({ forum, topPost }: { forum: ForumSummary; topPost: Post | null }) {
  return (
    <div className="bg-surface-raised rounded-xl overflow-hidden border border-surface-overlay hover:border-accent/15 transition-all duration-200 animate-fade-in">
      <Link
        href={`/v/${forum.nome}`}
        className="flex items-center gap-3 px-4 py-3 border-b border-surface-overlay hover:bg-surface-overlay transition-colors duration-150 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 text-xs font-bold text-accent group-hover:bg-accent/25 transition-all duration-200">
          {forum.nome.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-text-primary font-semibold text-sm group-hover:text-accent transition-colors duration-150">
            {forum.nome}
          </p>
          <p className="text-text-muted text-xs truncate">{forum.descricao}</p>
        </div>
      </Link>

      {topPost ? (
        <div className="divide-y divide-surface-overlay border-t border-surface-overlay">
          <PostCard
            postId={topPost.id}
            communitySlug={forum.nome}
            title={topPost.title}
            body={topPost.body}
            author={topPost.author?.username ?? "[deletado]"}
            timestamp={formatTimestamp(topPost.createdAt)}
            tags={topPost.tags}
            voteCount={topPost.voteCount}
            commentCount={topPost.commentCount}
            onUpvote={() => {}}
            onDownvote={() => {}}
          />
        </div>
      ) : (
        <p className="text-text-muted text-sm px-4 py-5">Nenhuma postagem ainda.</p>
      )}
    </div>
  );
}
