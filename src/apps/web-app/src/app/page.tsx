"use client";
import NavBar from "@/components/navbar";
import CommunityHero from "@/components/community-hero";
import PostCard from "@/components/post-card";
import CreatePost from "@/components/create-post";
export default function Home() {
  const defaultProps = {
    communityName: "Engenharia da Computação",
    memberCount: "12.4k",
    repositoryType: "PUC repositotyType",
    bannerSrc: "/banner.jpg",
    iconSrc: "/icon.png",
  };
  return (
    <div className="bg-surface-base min-h-screen flex flex-col">
      <NavBar />
      <main className="p-8 flex flex-col gap-4">
        <CommunityHero {...defaultProps}></CommunityHero>
        <CreatePost onPost={() => console.log("new post")}></CreatePost>
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
      </main>
    </div>
  );
}
