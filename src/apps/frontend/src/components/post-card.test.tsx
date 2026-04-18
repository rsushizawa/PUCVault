import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostCard from "@/components/post-card";

const defaultProps = {
  postId: "post-1",
  communityId: "community-1",
  title: "Resumo de Derivadas",
  body: "Pessoal, montei um guia rápido...",
  author: "u/rodrigo",
  timestamp: "4h ago",
  tags: [{ id: "calculo-i", name: "Cálculo I" }],
  voteCount: 142,
  commentCount: 24,
  onUpvote: vi.fn(),
  onDownvote: vi.fn(),
};

describe("PostCard", () => {
  test("renders the post title", () => {
    render(<PostCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });
  test("renders the author and timestamp", () => {
    render(<PostCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.author)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.timestamp)).toBeInTheDocument();
  });
  test("renders the vote count", () => {
    render(<PostCard {...defaultProps} />);
    expect(screen.getByText(String(defaultProps.voteCount))).toBeInTheDocument();
  });
  test("renders all tags", () => {
    const tagsProps = {
      ...defaultProps,
      tags: [...defaultProps.tags, { id: "prova", name: "PROVA" }],
    };
    render(<PostCard {...tagsProps} />);
    expect(screen.getByText(/cálculo i/i)).toBeInTheDocument();
    expect(screen.getByText(/prova/i)).toBeInTheDocument();
  });
  test("calls onUpvote when upvote button is clicked", async () => {
    const user = userEvent.setup();
    render(<PostCard {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    expect(defaultProps.onUpvote).toHaveBeenCalled();
  });
  test("calls onDownvote when downvote button is clicked", async () => {
    const user = userEvent.setup();
    render(<PostCard {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /downvote/i }));
    expect(defaultProps.onDownvote).toHaveBeenCalled();
  });
  test("content links to the post detail page", () => {
    render(<PostCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/community/${defaultProps.communityId}/post/${defaultProps.postId}`);
  });
});
