"use client";

import { useState } from "react";
import NavBar from "@/components/navbar";
import CommunityHero from "@/components/community-hero";
import TabsNavigation, { Tab } from "@/components/tabs-navigation";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { CommunitySidebar } from "@/components/community-sidebar";
import CommunityFiles, { Semester } from "@/components/community-files";

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

const mockSemesters: Semester[] = [
  {
    id: "s1",
    name: "1º Semestre",
    courses: [
      {
        id: "c1",
        name: "Introduction to Programming",
        files: [
          {
            id: "f1",
            name: "Aula 01 - Intro.pdf",
            uploadedAt: "2024-03-15",
            tags: [{ id: "lecture", name: "lecture" }],
            postId: "post-f1",
          },
          {
            id: "f2",
            name: "Exercícios 01.pdf",
            uploadedAt: "2024-02-10",
            tags: [{ id: "exercise", name: "exercise" }],
            postId: "post-f2",
          },
        ],
      },
      {
        id: "c2",
        name: "Calculus I",
        files: [
          {
            id: "f3",
            name: "Resumo Derivadas.pdf",
            uploadedAt: "2024-03-20",
            tags: [{ id: "summary", name: "summary" }],
            postId: "post-f3",
          },
          {
            id: "f4",
            name: "Lista P1.pdf",
            uploadedAt: "2024-03-01",
            tags: [{ id: "exercise", name: "exercise" }],
            postId: "post-f4",
          },
          {
            id: "f5",
            name: "Gabarito P1.pdf",
            uploadedAt: "2024-03-10",
            tags: [{ id: "exam", name: "exam" }],
            postId: "post-f5",
          },
        ],
      },
    ],
  },
  {
    id: "s2",
    name: "2º Semestre",
    courses: [
      {
        id: "c3",
        name: "Data Structures",
        files: [
          {
            id: "f6",
            name: "Lista 1.pdf",
            uploadedAt: "2024-04-01",
            tags: [{ id: "exercise", name: "exercise" }],
            postId: "post-f6",
          },
          {
            id: "f7",
            name: "Slides Árvores.pdf",
            uploadedAt: "2024-04-15",
            tags: [{ id: "lecture", name: "lecture" }],
            postId: "post-f7",
          },
        ],
      },
    ],
  },
];

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
                    { id: "calculo-i", name: "Cálculo I" },
                    { id: "resumo", name: "resumo" },
                  ]}
                  voteCount={142}
                  commentCount={24}
                  onUpvote={() => console.log("upvote")}
                  onDownvote={() => console.log("downvote")}
                />
              </>
            )}
            {activeTab === "arquivos" && (
              <CommunityFiles semesters={mockSemesters} />
            )}
          </div>

          <CommunitySidebar {...mockSidebarProps} />
        </div>
      </div>
    </div>
  );
}
