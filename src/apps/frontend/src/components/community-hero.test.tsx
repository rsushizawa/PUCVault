import { render, screen } from "@testing-library/react";
import CommunityHero from "@/components/community-hero";

describe("CommunityHero", () => {
  const defaultProps = {
    communityName: "Engenharia da Computação",
    memberCount: "12.4k",
    repositoryType: "PUC repositotyType",
    bannerSrc: "/banner.jpg",
    iconSrc: "/icon.png",
    onFollow: vi.fn(),
  };
  test("renders the community name", () => {
    render(<CommunityHero {...defaultProps} />);
    expect(screen.getByText(defaultProps.communityName)).toBeInTheDocument();
  });
  test("renders the member count", () => {
    render(<CommunityHero {...defaultProps} />);
    expect(screen.getByText(defaultProps.memberCount)).toBeInTheDocument();
  });
  test("renders the follow button", () => {
    render(<CommunityHero {...defaultProps} />);
    expect(screen.getByRole("button", { name: /seguir/i })).toBeInTheDocument();
  });
});
