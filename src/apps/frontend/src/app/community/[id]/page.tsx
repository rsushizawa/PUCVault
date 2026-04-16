"use client";

import { useState } from "react";
import NavBar from "@/components/navbar";
import CommunityHero from "@/components/community-hero";
import TabsNavigation, { Tab } from "@/components/tabs-navigation";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { CommunitySidebar } from "@/components/community-sidebar";

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
  const [activeTab, setActiveTab] = useState<Tab>("forum");

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      <NavBar />
      <CommunityHero {...mockHeroProps} />
      <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          {/* Main content */}
          <div className="flex flex-col gap-4">
            {activeTab === "forum" && (
              <>
                <CreatePost
                  onPost={() => console.log("new post")}
                  availableTags={["question", "resource", "discussion"]}
                />
                <PostCard
                  title="Resumo de Derivadas e Integrais para a P1"
                  body="Pessoal, montei um guia rápido com as principais regras de derivação que o professor comentou que vai cair na prova de quarta."
                  author="u/matheusz"
                  timestamp="4h ago"
                  tags={[
                    { label: "Cálculo I", color: "rgba(2,84,134,0.3)" },
                    { label: "resumo", color: "rgba(2,84,134,0.3)" },
                  ]}
                  voteCount={142}
                  commentCount={24}
                  onUpvote={() => console.log("upvote")}
                  onDownvote={() => console.log("downvote")}
                />
              </>
            )}
            {activeTab === "arquivos" && (
              <div className="text-text-muted text-sm">
                Files will go here.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <CommunitySidebar {...mockSidebarProps} />
        </div>
      </div>
    </div>
  );
}
