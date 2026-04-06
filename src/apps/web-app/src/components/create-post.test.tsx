import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePost from "@/components/create-post";

const defaultProps = {
  onPost: vi.fn(),
  availableTags: ["question", "resource", "discussion"],
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
    expect(defaultProps.onPost).toHaveBeenCalledWith("hello", []);
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
describe("CreatePost tag selection", () => {
  test("render tag pills when exppanded", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    expect(
      screen.getByRole("button", { name: /question/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resource/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /discussion/i }),
    ).toBeInTheDocument();
  });
  test("clicking a tag pill adds it to selection", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    await user.click(screen.getByRole("button", { name: /resource/i }));
    expect(screen.getByRole("button", { name: /resource/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  test("clicking a selected  tag deselcts it", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    await user.click(screen.getByRole("button", { name: /resource/i }));
    await user.click(screen.getByRole("button", { name: /resource/i }));
    expect(screen.getByRole("button", { name: /resource/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
  test("onPost is called with the correct tags array", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    await user.type(screen.getByRole("textbox"), "hello");
    await user.click(screen.getByRole("button", { name: /resource/i }));
    await user.click(screen.getByRole("button", { name: /^post$/i }));
    expect(defaultProps.onPost).toHaveBeenCalled();
    expect(defaultProps.onPost).toHaveBeenCalledWith("hello", ["resource"]);
  });
});
