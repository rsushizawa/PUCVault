import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PostDetail from "@/components/post-detail";
import type { Post } from "@/types/api";

const mockPost: Post = {
  id: "post-1",
  title: "Test Post Title",
  body: "This is the post body.",
  author: { id: "u1", username: "testuser" },
  createdAt: new Date(Date.now() - 2 * 36e5).toISOString(),
  tags: [{ id: "tag-math", name: "Math" }],
  voteCount: 10,
  commentCount: 3,
  fileUrl: undefined,
};

const defaultProps = {
  post: mockPost,
  communityId: "comm-1",
  onVote: vi.fn(),
};

describe("PostDetail", () => {
  test("renders the post title as h1", () => {
    render(<PostDetail {...defaultProps} />);
    expect(
      screen.getByRole("heading", { level: 1, name: /test post title/i }),
    ).toBeInTheDocument();
  });

  test("renders the post body text", () => {
    render(<PostDetail {...defaultProps} />);
    expect(screen.getByText("This is the post body.")).toBeInTheDocument();
  });

  test("renders the author username", () => {
    render(<PostDetail {...defaultProps} />);
    expect(screen.getByText(/u\/testuser/)).toBeInTheDocument();
  });

  test("author username links to profile page", () => {
    render(<PostDetail {...defaultProps} />);
    const link = screen.getByRole("link", { name: /u\/testuser/ });
    expect(link).toHaveAttribute("href", "/user/testuser");
  });

  test("renders the vote count", () => {
    render(<PostDetail {...defaultProps} />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("renders the comment count", () => {
    render(<PostDetail {...defaultProps} />);
    expect(screen.getByText(/3 comments/i)).toBeInTheDocument();
  });

  test("renders post tags", () => {
    render(<PostDetail {...defaultProps} />);
    expect(screen.getByText(/math/i)).toBeInTheDocument();
  });

  test("calls onVote with 1 when upvote is clicked", async () => {
    const onVote = vi.fn();
    const user = userEvent.setup();
    render(<PostDetail {...defaultProps} onVote={onVote} />);
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    expect(onVote).toHaveBeenCalledWith(1);
  });

  test("calls onVote with -1 when downvote is clicked", async () => {
    const onVote = vi.fn();
    const user = userEvent.setup();
    render(<PostDetail {...defaultProps} onVote={onVote} />);
    await user.click(screen.getByRole("button", { name: /downvote/i }));
    expect(onVote).toHaveBeenCalledWith(-1);
  });

  test("optimistically increments vote count on upvote", async () => {
    const user = userEvent.setup();
    render(<PostDetail {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    expect(screen.getByText("11")).toBeInTheDocument();
  });

  test("optimistically decrements vote count on downvote", async () => {
    const user = userEvent.setup();
    render(<PostDetail {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /downvote/i }));
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  test("cancels upvote if upvote is clicked again", async () => {
    const user = userEvent.setup();
    render(<PostDetail {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("does not render file attachment when fileUrl is absent", () => {
    render(<PostDetail {...defaultProps} />);
    expect(screen.queryByText(/download attachment/i)).not.toBeInTheDocument();
  });

  test("renders file attachment link when fileUrl is set", () => {
    const post = { ...mockPost, fileUrl: "https://example.com/file.pdf" };
    render(<PostDetail post={post} communityId="comm-1" onVote={vi.fn()} />);
    const link = screen.getByRole("link", { name: /download attachment/i });
    expect(link).toHaveAttribute("href", "https://example.com/file.pdf");
  });
});
