import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePost from "@/components/create-post";

const defaultProps = {
  forumId: "test-forum",
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
    expect(defaultProps.onPost).toHaveBeenCalledWith("hello", [], false);
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
    expect(defaultProps.onPost).toHaveBeenCalledWith(
      "hello",
      ["resource"],
      false,
    );
  });
});
describe("CreatePost toolbar", () => {
  async function expandPost() {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps} />);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    return user;
  }

  function textarea() {
    return screen.getByRole("textbox") as HTMLTextAreaElement;
  }

  test("toolbar is not visible when collapsed", () => {
    render(<CreatePost {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /bold/i })).not.toBeInTheDocument();
  });

  test("toolbar renders when expanded", async () => {
    await expandPost();
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
  });

  test.each([
    "Bold",
    "Italic",
    "Link",
    "Strikethrough",
    "Code",
    "Bulleted list",
    "Numbered list",
    "Quote",
    "Insert image",
    "Embed",
  ])("toolbar has %s button", async (label) => {
    await expandPost();
    expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
  });

  test("bold wraps selection with **", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /bold/i }));
    expect(textarea().value).toBe("hello **world**");
  });

  test("bold inserts placeholder when nothing is selected", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /bold/i }));
    expect(textarea().value).toBe("**bold text**");
  });

  test("italic wraps selection with *", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /italic/i }));
    expect(textarea().value).toBe("hello *world*");
  });

  test("link wraps selection as [text](url)", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /link/i }));
    expect(textarea().value).toBe("hello [world](url)");
  });

  test("strikethrough wraps selection with ~~", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /strikethrough/i }));
    expect(textarea().value).toBe("hello ~~world~~");
  });

  test("code wraps selection with backticks", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^code$/i }));
    expect(textarea().value).toBe("hello `world`");
  });

  test("bulleted list prefixes current line with -", async () => {
    const user = await expandPost();
    await user.type(textarea(), "item");
    await user.click(screen.getByRole("button", { name: /bulleted list/i }));
    expect(textarea().value).toBe("- item");
  });

  test("numbered list prefixes current line with 1.", async () => {
    const user = await expandPost();
    await user.type(textarea(), "item");
    await user.click(screen.getByRole("button", { name: /numbered list/i }));
    expect(textarea().value).toBe("1. item");
  });

  test("quote prefixes current line with >", async () => {
    const user = await expandPost();
    await user.type(textarea(), "item");
    await user.click(screen.getByRole("button", { name: /quote/i }));
    expect(textarea().value).toBe("> item");
  });

  test("insert image wraps selection as ![alt](url)", async () => {
    const user = await expandPost();
    await user.type(textarea(), "photo");
    textarea().setSelectionRange(0, 5);
    await user.click(screen.getByRole("button", { name: /insert image/i }));
    expect(textarea().value).toBe("![photo](url)");
  });

  test("embed wraps selection as [embed](url)", async () => {
    const user = await expandPost();
    await user.type(textarea(), "https://example.com");
    textarea().setSelectionRange(0, 19);
    await user.click(screen.getByRole("button", { name: /embed/i }));
    expect(textarea().value).toBe("[embed](https://example.com)");
  });
});

describe("CreatePost new tag creator", () => {
  async function expandPost() {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps} />);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    return user;
  }

  test("shows add tag button when expanded", async () => {
    await expandPost();
    expect(screen.getByRole("button", { name: /add tag/i })).toBeInTheDocument();
  });

  test("clicking add tag shows an input", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    expect(screen.getByRole("textbox", { name: /new tag name/i })).toBeInTheDocument();
  });

  test("add tag button is hidden while input is open", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    expect(screen.queryByRole("button", { name: /add tag/i })).not.toBeInTheDocument();
  });

  test("pressing Enter confirms new tag and renders it as a pill", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.type(screen.getByRole("textbox", { name: /new tag name/i }), "announcement{Enter}");
    expect(screen.getByRole("button", { name: /announcement/i })).toBeInTheDocument();
  });

  test("new tag is auto-selected after creation", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.type(screen.getByRole("textbox", { name: /new tag name/i }), "announcement{Enter}");
    expect(screen.getByRole("button", { name: /announcement/i })).toHaveAttribute("aria-pressed", "true");
  });

  test("pressing Escape cancels without adding a tag", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.type(screen.getByRole("textbox", { name: /new tag name/i }), "announcement{Escape}");
    expect(screen.queryByRole("button", { name: /announcement/i })).not.toBeInTheDocument();
  });

  test("duplicate tags are not added", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.type(screen.getByRole("textbox", { name: /new tag name/i }), "question{Enter}");
    expect(screen.getAllByRole("button", { name: /question/i })).toHaveLength(1);
  });

  test("new tag is included in onPost call when selected", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /add tag/i }));
    await user.type(screen.getByRole("textbox", { name: /new tag name/i }), "announcement{Enter}");
    await user.click(screen.getByRole("button", { name: /^post$/i }));
    expect(defaultProps.onPost).toHaveBeenCalledWith("", ["announcement"], false);
  });
});

describe("CreatePost notifications", () => {
  test("notification checkbox notifyOnReply", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps}></CreatePost>);
    await user.click(
      screen.getByPlaceholderText("Ask a question or share an insight..."),
    );
    await user.type(screen.getByRole("textbox"), "hello");
    const checkbox = screen.getByRole("checkbox", {
      name: /send me post reply/i,
    });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(screen.getByRole("button", { name: /^post$/i }));
    expect(defaultProps.onPost).toHaveBeenCalled();
    expect(defaultProps.onPost).toHaveBeenCalledWith("hello", [], true);
  });
});
