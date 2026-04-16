import { render, screen } from "@testing-library/react";
import {
  CommunitySidebar,
  CommunityRule,
  CommunitySidebarProps,
} from "@/components/community-sidebar";

const defaultRules: CommunityRule[] = [
  { id: 1, title: "Be respectful", description: "não seja chato" },
  {
    id: 2,
    title: "Don't post really weird stuff",
    description: "não seja chato",
  },
];

const defaultProps: CommunitySidebarProps = {
  communityName: "Eng. Computação",
  createdAt: "13/04/26",
  isPublic: true,
  memberCount: "100",
  memberLabel: "PUC",
  postCount: "10",
  postLabel: "qtd de posts",
  rules: defaultRules,
};

describe("Community Sidebar test", () => {
  test("render the community name", () => {
    render(<CommunitySidebar {...defaultProps}></CommunitySidebar>);
    expect(screen.getByText(defaultProps.communityName)).toBeInTheDocument();
  });
  test("render the creation date", () => {
    render(<CommunitySidebar {...defaultProps}></CommunitySidebar>);
    expect(screen.getByText(defaultProps.createdAt)).toBeInTheDocument();
  });
  test("render the member count and its label", () => {
    render(<CommunitySidebar {...defaultProps}></CommunitySidebar>);
    expect(screen.getByText(defaultProps.memberCount)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.memberLabel)).toBeInTheDocument();
  });
  test("render Public whrn isPublic is True", () => {
    render(<CommunitySidebar {...defaultProps}></CommunitySidebar>);
    expect(screen.getByText("Public")).toBeInTheDocument();
  });
  test("renders post count and its label", () => {
    render(<CommunitySidebar {...defaultProps}></CommunitySidebar>);
    expect(screen.getByText(defaultProps.postCount)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.postLabel)).toBeInTheDocument();
  });
  test("renders all rule titles", () => {
    render(<CommunitySidebar {...defaultProps}></CommunitySidebar>);
    defaultRules.forEach((rule) => {
      expect(screen.getByText(rule.title)).toBeInTheDocument();
    });
  });
});
