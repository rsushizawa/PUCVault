import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentNode from "@/components/comment-node";
import type { Comment } from "@/types/api";

const leafComment: Comment = {
  id: "c1",
  body: "This is a comment.",
  author: { id: "u1", username: "alice" },
  createdAt: new Date(Date.now() - 36e5).toISOString(),
  voteCount: 5,
  level: 1,
  children: [],
};

const childComment: Comment = {
  id: "c2",
  body: "Child comment.",
  author: { id: "u2", username: "bob" },
  createdAt: new Date(Date.now() - 30 * 60e3).toISOString(),
  voteCount: 2,
  level: 2,
  children: [],
};

const parentComment: Comment = {
  ...leafComment,
  body: "Parent comment.",
  children: [childComment],
};

const defaultProps = {
  comment: leafComment,
  onVote: vi.fn(),
  onReply: vi.fn(),
};

describe("CommentNode rendering", () => {
  test("renders author username", () => {
    render(<CommentNode {...defaultProps} />);
    expect(screen.getByText(/u\/alice/)).toBeInTheDocument();
  });

  test("renders comment body", () => {
    render(<CommentNode {...defaultProps} />);
    expect(screen.getByText("This is a comment.")).toBeInTheDocument();
  });

  test("renders vote count", () => {
    render(<CommentNode {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("renders nested child comments recursively", () => {
    render(<CommentNode comment={parentComment} depth={0} onVote={vi.fn()} onReply={vi.fn()} />);
    expect(screen.getByText("Parent comment.")).toBeInTheDocument();
    expect(screen.getByText("Child comment.")).toBeInTheDocument();
  });

  test("shows indent line for nested (depth > 0) comments", () => {
    render(<CommentNode {...defaultProps} depth={1} />);
    expect(screen.getByRole("button", { name: /collapse thread/i })).toBeInTheDocument();
  });

  test("does not show indent line for top-level (depth = 0) comments", () => {
    render(<CommentNode {...defaultProps} depth={0} />);
    expect(screen.queryByRole("button", { name: /collapse thread/i })).not.toBeInTheDocument();
  });
});

describe("CommentNode collapse", () => {
  test("shows [–] collapse toggle for top-level comments", () => {
    render(<CommentNode {...defaultProps} depth={0} />);
    expect(screen.getByRole("button", { name: /^collapse$/i })).toBeInTheDocument();
  });

  test("collapses body when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<CommentNode {...defaultProps} depth={0} />);
    await user.click(screen.getByRole("button", { name: /^collapse$/i }));
    expect(screen.queryByText("This is a comment.")).not.toBeInTheDocument();
  });

  test("shows (N replies hidden) label when collapsed with children", async () => {
    const user = userEvent.setup();
    render(<CommentNode comment={parentComment} depth={0} onVote={vi.fn()} onReply={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /^collapse$/i }));
    expect(screen.getByText(/1 reply hidden/i)).toBeInTheDocument();
  });

  test("re-expands when toggle is clicked again", async () => {
    const user = userEvent.setup();
    render(<CommentNode {...defaultProps} depth={0} />);
    await user.click(screen.getByRole("button", { name: /^collapse$/i }));
    await user.click(screen.getByRole("button", { name: /^expand$/i }));
    expect(screen.getByText("This is a comment.")).toBeInTheDocument();
  });
});

describe("CommentNode voting", () => {
  test("calls onVote with commentId and 1 on upvote", async () => {
    const onVote = vi.fn();
    const user = userEvent.setup();
    render(<CommentNode comment={leafComment} depth={0} onVote={onVote} onReply={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /upvote comment/i }));
    expect(onVote).toHaveBeenCalledWith("c1", 1);
  });

  test("calls onVote with commentId and -1 on downvote", async () => {
    const onVote = vi.fn();
    const user = userEvent.setup();
    render(<CommentNode comment={leafComment} depth={0} onVote={onVote} onReply={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /downvote comment/i }));
    expect(onVote).toHaveBeenCalledWith("c1", -1);
  });

  test("optimistically increments vote count on upvote", async () => {
    const user = userEvent.setup();
    render(<CommentNode {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /upvote comment/i }));
    expect(screen.getByText("6")).toBeInTheDocument();
  });
});

describe("CommentNode reply", () => {
  test("shows Reply button when depth is below max", () => {
    render(<CommentNode {...defaultProps} depth={0} />);
    expect(screen.getByRole("button", { name: /^reply$/i })).toBeInTheDocument();
  });

  test("hides Reply button when depth equals maxDepth (4)", () => {
    render(<CommentNode {...defaultProps} depth={4} />);
    expect(screen.queryByRole("button", { name: /^reply$/i })).not.toBeInTheDocument();
  });

  test("opens reply composer when Reply is clicked", async () => {
    const user = userEvent.setup();
    render(<CommentNode {...defaultProps} depth={0} />);
    await user.click(screen.getByRole("button", { name: /^reply$/i }));
    expect(screen.getByPlaceholderText(/write a reply/i)).toBeInTheDocument();
  });

  test("calls onReply with parentId and content on submit", async () => {
    const onReply = vi.fn();
    const user = userEvent.setup();
    render(<CommentNode comment={leafComment} depth={0} onVote={vi.fn()} onReply={onReply} />);
    await user.click(screen.getByRole("button", { name: /^reply$/i }));
    await user.type(screen.getByPlaceholderText(/write a reply/i), "my reply");
    // Click the submit "Reply" button (last one in the DOM)
    const replyButtons = screen.getAllByRole("button", { name: /^reply$/i });
    await user.click(replyButtons[replyButtons.length - 1]);
    expect(onReply).toHaveBeenCalledWith("c1", "my reply");
  });

  test("closes reply composer after submit", async () => {
    const user = userEvent.setup();
    render(<CommentNode {...defaultProps} depth={0} />);
    await user.click(screen.getByRole("button", { name: /^reply$/i }));
    await user.type(screen.getByPlaceholderText(/write a reply/i), "reply text");
    const replyButtons = screen.getAllByRole("button", { name: /^reply$/i });
    await user.click(replyButtons[replyButtons.length - 1]);
    expect(screen.queryByPlaceholderText(/write a reply/i)).not.toBeInTheDocument();
  });

  test("closes reply composer when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<CommentNode {...defaultProps} depth={0} />);
    await user.click(screen.getByRole("button", { name: /^reply$/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByPlaceholderText(/write a reply/i)).not.toBeInTheDocument();
  });

  test("does not call onReply when reply content is empty", async () => {
    const onReply = vi.fn();
    const user = userEvent.setup();
    render(<CommentNode comment={leafComment} depth={0} onVote={vi.fn()} onReply={onReply} />);
    await user.click(screen.getByRole("button", { name: /^reply$/i }));
    const replyButtons = screen.getAllByRole("button", { name: /^reply$/i });
    await user.click(replyButtons[replyButtons.length - 1]);
    expect(onReply).not.toHaveBeenCalled();
  });
});
