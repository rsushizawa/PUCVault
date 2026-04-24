"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/navbar";
import CommunityHero from "@/components/community-hero";
import TabsNavigation, { Tab } from "@/components/tabs-navigation";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { CommunitySidebar } from "@/components/community-sidebar";
import CommunityFiles, { Semester } from "@/components/community-files";
import { getCommunityPosts, getCommunityFiles } from "@/lib/api/communities";
import { votePost, createPost } from "@/lib/api/posts";
import type { Post } from "@/types/api";

function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

const mockSidebarProps = {
  communityName: "Engenharia da Computação",
  createdAt: "13/04/26",
  isPublic: true,
  memberCount: "12.4k",
  memberLabel: "Members",
  postCount: "340",
  postLabel: "Posts",
  rules: [
    { id: 1, title: "Be respectful", description: "Treat others kindly." },
    { id: 2, title: "No plagiarism", description: "Always credit sources." },
    { id: 3, title: "Stay on topic", description: "Keep posts relevant." },
  ],
};

const mockHeroProps = {
  communityName: "Engenharia da Computação",
  memberCount: "12.4k",
  repositoryType: "Public",
  bannerSrc: "/banner.jpg",
  iconSrc: "/icon.png",
};

export default function CommunityPage() {
  const { id: communityId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("forum");

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);

  useEffect(() => {
    getCommunityPosts(communityId)
      .then(({ posts }) => setPosts(posts))
      .catch(() => setPostsError("Failed to load posts."))
      .finally(() => setPostsLoading(false));
  }, [communityId]);

  useEffect(() => {
    getCommunityFiles(communityId, "default")
      .then(setSemesters)
      .catch(() => setFilesError("Failed to load files."))
      .finally(() => setFilesLoading(false));
  }, [communityId]);

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <CommunityHero {...mockHeroProps} />
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex flex-col gap-4">
            {activeTab === "forum" && (
              <>
                <CreatePost
                  onPost={async (data) => {
                    await createPost(communityId, { ...data, tags: [] });
                    getCommunityPosts(communityId).then(({ posts }) => setPosts(posts));
                  }}
                  availableTags={["question", "resource", "discussion"]}
                />
                {postsLoading && (
                  <p className="text-text-muted text-sm">Loading posts...</p>
                )}
                {postsError && (
                  <p className="text-sm text-red-400">{postsError}</p>
                )}
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    postId={post.id}
                    communitySlug={communityId}
                    title={post.title}
                    body={post.body}
                    author={`u/${post.author.username}`}
                    timestamp={formatTimestamp(post.createdAt)}
                    tags={post.tags}
                    voteCount={post.voteCount}
                    commentCount={post.commentCount}
                    onUpvote={() => votePost(post.id, 1).catch(() => {})}
                    onDownvote={() => votePost(post.id, -1).catch(() => {})}
                  />
                ))}
              </>
            )}
            {activeTab === "arquivos" && (
              <>
                {filesLoading && (
                  <p className="text-text-muted text-sm">Loading files...</p>
                )}
                {filesError && (
                  <p className="text-sm text-red-400">{filesError}</p>
                )}
                {!filesLoading && !filesError && (
                  <CommunityFiles semesters={semesters} />
                )}
              </>
            )}
          </div>

          <CommunitySidebar {...mockSidebarProps} />
        </div>
      </div>
    </div>
  );
}
