import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarkdownEditor from "@/components/markdown-editor";

const defaultProps = {
  value: "",
  onChange: vi.fn(),
  placeholder: "Type here...",
};

describe("MarkdownEditor tabs", () => {
  test("renders Write and Preview tabs", () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByRole("button", { name: /^write$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^preview$/i })).toBeInTheDocument();
  });

  test("shows textarea in Write mode by default", () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  test("hides textarea when Preview tab is clicked", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    expect(screen.queryByPlaceholderText("Type here...")).not.toBeInTheDocument();
  });

  test("shows 'Nothing to preview' when value is empty in Preview mode", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} value="" />);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    expect(screen.getByText(/nothing to preview/i)).toBeInTheDocument();
  });

  test("renders markdown in Preview mode", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} value="**bold text**" />);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    const el = screen.getByText("bold text");
    expect(el.tagName).toBe("STRONG");
  });

  test("returns to Write mode when Write tab is clicked", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /^preview$/i }));
    await user.click(screen.getByRole("button", { name: /^write$/i }));
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  test("calls onChange when user types", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MarkdownEditor value="" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });
});

describe("MarkdownEditor toolbar", () => {
  async function setup(value = "") {
    const onChange = vi.fn((v: string) => v);
    const user = userEvent.setup();
    const result = render(
      <MarkdownEditor value={value} onChange={onChange} placeholder="Write..." />,
    );
    const textarea = () => screen.getByRole("textbox") as HTMLTextAreaElement;
    return { user, onChange, textarea, result };
  }

  test.each([
    "Bold", "Italic", "Link", "Strikethrough", "Code",
    "Bulleted list", "Numbered list", "Quote", "Insert image", "Embed",
  ])("renders %s toolbar button", async (label) => {
    await setup();
    expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
  });

  test("Bold wraps selection with **", async () => {
    const { user, onChange, textarea } = await setup("hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /bold/i }));
    expect(onChange).toHaveBeenCalledWith("hello **world**");
  });

  test("Italic wraps selection with *", async () => {
    const { user, onChange, textarea } = await setup("hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /italic/i }));
    expect(onChange).toHaveBeenCalledWith("hello *world*");
  });

  test("Code wraps selection with backticks", async () => {
    const { user, onChange, textarea } = await setup("hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^code$/i }));
    expect(onChange).toHaveBeenCalledWith("hello `world`");
  });

  test("Bulleted list prefixes current line with -", async () => {
    const { user, onChange } = await setup("item");
    await user.click(screen.getByRole("button", { name: /bulleted list/i }));
    expect(onChange).toHaveBeenCalledWith("- item");
  });
});
