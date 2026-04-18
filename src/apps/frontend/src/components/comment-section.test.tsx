import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CommentSection from "@/components/comment-section";
import type { Comment } from "@/types/api";

vi.mock("@/lib/api/posts", () => ({
  createComment: vi.fn().mockResolvedValue({}),
  voteComment: vi.fn().mockResolvedValue({}),
}));

import { createComment, voteComment } from "@/lib/api/posts";

const mockComment: Comment = {
  id: "c1",
  body: "A top-level comment.",
  author: { id: "u1", username: "alice" },
  createdAt: new Date(Date.now() - 36e5).toISOString(),
  voteCount: 3,
  level: 1,
  children: [],
};

describe("CommentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the comment composer", () => {
    render(<CommentSection comments={[]} postId="post-1" />);
    expect(screen.getByPlaceholderText(/add a comment/i)).toBeInTheDocument();
  });

  test("renders a Comment button", () => {
    render(<CommentSection comments={[]} postId="post-1" />);
    expect(screen.getByRole("button", { name: /^comment$/i })).toBeInTheDocument();
  });

  test("shows empty state when no comments are provided", () => {
    render(<CommentSection comments={[]} postId="post-1" />);
    expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
  });

  test("renders provided comments", () => {
    render(<CommentSection comments={[mockComment]} postId="post-1" />);
    expect(screen.getByText("A top-level comment.")).toBeInTheDocument();
  });

  test("renders multiple comments", () => {
    const second: Comment = {
      ...mockComment,
      id: "c2",
      body: "Second comment.",
      author: { id: "u2", username: "bob" },
    };
    render(<CommentSection comments={[mockComment, second]} postId="post-1" />);
    expect(screen.getByText("A top-level comment.")).toBeInTheDocument();
    expect(screen.getByText("Second comment.")).toBeInTheDocument();
  });

  test("calls createComment with postId and content when Comment is clicked", async () => {
    const user = userEvent.setup();
    render(<CommentSection comments={[]} postId="post-1" />);
    await user.type(screen.getByPlaceholderText(/add a comment/i), "hello there");
    await user.click(screen.getByRole("button", { name: /^comment$/i }));
    await waitFor(() =>
      expect(createComment).toHaveBeenCalledWith("post-1", { content: "hello there" }),
    );
  });

  test("clears the composer after submitting a comment", async () => {
    const user = userEvent.setup();
    render(<CommentSection comments={[]} postId="post-1" />);
    const textarea = screen.getByPlaceholderText(/add a comment/i);
    await user.type(textarea, "hello there");
    await user.click(screen.getByRole("button", { name: /^comment$/i }));
    await waitFor(() => expect(textarea).toHaveValue(""));
  });

  test("does not call createComment when comment is empty", async () => {
    const user = userEvent.setup();
    render(<CommentSection comments={[]} postId="post-1" />);
    await user.click(screen.getByRole("button", { name: /^comment$/i }));
    expect(createComment).not.toHaveBeenCalled();
  });

  test("calls voteComment when a comment is upvoted", async () => {
    const user = userEvent.setup();
    render(<CommentSection comments={[mockComment]} postId="post-1" />);
    await user.click(screen.getByRole("button", { name: /upvote comment/i }));
    await waitFor(() =>
      expect(voteComment).toHaveBeenCalledWith("c1", 1),
    );
  });

  test("calls createComment with parentId when replying to a comment", async () => {
    const user = userEvent.setup();
    render(<CommentSection comments={[mockComment]} postId="post-1" />);
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
  });
});
