import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CommentSection from "@/components/comment-section";
import type { Comment } from "@/types/api";

const mockComment: Comment = {
  id: "c1",
  body: "A top-level comment.",
  author: { id: "u1", username: "alice" },
  createdAt: new Date(Date.now() - 36e5).toISOString(),
  voteCount: 3,
  level: 1,
  children: [],
};

vi.mock("@/lib/api/comments", () => ({
  getComments: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue({}),
  voteComment: vi.fn().mockResolvedValue({}),
}));

import { getComments, createComment, voteComment } from "@/lib/api/comments";

describe("CommentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getComments as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  test("renders the comment composer trigger", async () => {
    render(<CommentSection postId="post-1" />);
    expect(screen.getByText(/adicionar um comentário/i)).toBeInTheDocument();
  });

  test("shows empty state when no comments are returned", async () => {
    render(<CommentSection postId="post-1" />);
    await waitFor(() =>
      expect(screen.getByText(/nenhum comentário ainda/i)).toBeInTheDocument(),
    );
  });

  test("renders comments returned by getComments", async () => {
    (getComments as ReturnType<typeof vi.fn>).mockResolvedValue([mockComment]);
    render(<CommentSection postId="post-1" />);
    await waitFor(() =>
      expect(screen.getByText("A top-level comment.")).toBeInTheDocument(),
    );
  });

  test("renders multiple comments", async () => {
    const second: Comment = {
      ...mockComment,
      id: "c2",
      body: "Second comment.",
      author: { id: "u2", username: "bob" },
    };
    (getComments as ReturnType<typeof vi.fn>).mockResolvedValue([mockComment, second]);
    render(<CommentSection postId="post-1" />);
    await waitFor(() => {
      expect(screen.getByText("A top-level comment.")).toBeInTheDocument();
      expect(screen.getByText("Second comment.")).toBeInTheDocument();
    });
  });

  test("calls createComment and refreshes on submit", async () => {
    const user = userEvent.setup();
    render(<CommentSection postId="post-1" />);
    await user.click(screen.getByText(/adicionar um comentário/i));
    await user.type(screen.getByPlaceholderText(/escreva um comentário/i), "hello there");
    await user.click(screen.getByRole("button", { name: /comentar/i }));
    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith("post-1", { content: "hello there" }),
    );
    expect(getComments).toHaveBeenCalledTimes(2);
  });

  test("does not call createComment when comment is empty", async () => {
    const user = userEvent.setup();
    render(<CommentSection postId="post-1" />);
    await user.click(screen.getByText(/adicionar um comentário/i));
    await user.click(screen.getByRole("button", { name: /comentar/i }));
    expect(createComment).not.toHaveBeenCalled();
  });

  test("calls voteComment when a comment is upvoted", async () => {
    (getComments as ReturnType<typeof vi.fn>).mockResolvedValue([mockComment]);
    const user = userEvent.setup();
    render(<CommentSection postId="post-1" />);
    await waitFor(() => screen.getByRole("button", { name: /upvote comment/i }));
    await user.click(screen.getByRole("button", { name: /upvote comment/i }));
    await waitFor(() => expect(voteComment).toHaveBeenCalledWith("c1", 1));
  });

  test("calls createComment with parentId and refreshes when replying", async () => {
    (getComments as ReturnType<typeof vi.fn>).mockResolvedValue([mockComment]);
    const user = userEvent.setup();
    render(<CommentSection postId="post-1" />);
    await waitFor(() => screen.getByRole("button", { name: /^reply$/i }));
    await user.click(screen.getByRole("button", { name: /^reply$/i }));
    await user.type(screen.getByPlaceholderText(/write a reply/i), "my reply");
    const replyButtons = screen.getAllByRole("button", { name: /^reply$/i });
    await user.click(replyButtons[replyButtons.length - 1]);
    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith("post-1", {
        content: "my reply",
        parentId: "c1",
      }),
    );
    expect(getComments).toHaveBeenCalledTimes(2);
  });
});
