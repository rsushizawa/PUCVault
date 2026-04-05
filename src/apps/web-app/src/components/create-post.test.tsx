import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePost from "@/components/create-post";

const defaultProps = {
  onPost: vi.fn(),
};

describe("CreatePost", () => {
  test("renders collapsed bar by default", () => {
    render(<CreatePost {...defaultProps}></CreatePost>);
    expect(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    ).toBeInTheDocument();
  });
  test("expands when the collapsed bar is clicked", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    expect(screen.queryByRole("textbox")).toBeInTheDocument();
  });
  test("call onPost with the content when Post is clicked", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    await user.type(screen.getByRole("textbox"), "hello");
    await user.click(screen.getByRole("button", { name: /^post$/i }));
    expect(defaultProps.onPost).toHaveBeenCalled();
    expect(defaultProps.onPost).toHaveBeenCalledWith("hello");
  });
  test("collapses back when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
