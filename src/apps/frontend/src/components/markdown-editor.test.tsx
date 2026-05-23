import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MarkdownEditor from "@/components/markdown-editor";

const defaultProps = {
  value: "",
  onChange: vi.fn(),
  placeholder: "Type here...",
};

describe("MarkdownEditor tabs", () => {
  test("renders Escrever and Visualizar tabs", () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByRole("button", { name: /^Escrever$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Visualizar$/i })).toBeInTheDocument();
  });

  test("shows textarea in Write mode by default", () => {
    render(<MarkdownEditor {...defaultProps} />);
    expect(screen.getByPlaceholderText("Type here...")).toBeInTheDocument();
  });

  test("shows 'Nada para visualizar.' when value is empty in Preview mode", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} value="" />);
    await user.click(screen.getByRole("button", { name: /^Visualizar$/i }));
    expect(screen.getByText(/nada para visualizar/i)).toBeInTheDocument();
  });

  test("renders markdown in Preview mode", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} value="**bold text**" />);
    await user.click(screen.getByRole("button", { name: /^Visualizar$/i }));
    const el = screen.getByText("bold text");
    expect(el.tagName).toBe("STRONG");
  });

  test("returns to Write mode when Escrever tab is clicked", async () => {
    const user = userEvent.setup();
    render(<MarkdownEditor {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /^Visualizar$/i }));
    await user.click(screen.getByRole("button", { name: /^Escrever$/i }));
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
    ["Negrito", /^Negrito$/i],
    ["Itálico", /^Itálico$/i],
    ["Link", /^Link$/i],
    ["Tachado", /^Tachado$/i],
    ["Código", /^Código$/i],
    ["Lista", /^Lista$/i],
    ["Lista numerada", /^Lista numerada$/i],
    ["Citação", /^Citação$/i],
    ["Imagem", /^Imagem$/i],
  ] as [string, RegExp][])("renders %s toolbar button", async (_label, pattern) => {
    await setup();
    expect(screen.getByRole("button", { name: pattern })).toBeInTheDocument();
  });

  test("Negrito wraps selection with **", async () => {
    const { user, onChange, textarea } = await setup("hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^Negrito$/i }));
    expect(onChange).toHaveBeenCalledWith("hello **world**");
  });

  test("Negrito inserts placeholder when nothing is selected", async () => {
    const { user, onChange } = await setup();
    await user.click(screen.getByRole("button", { name: /^Negrito$/i }));
    expect(onChange).toHaveBeenCalledWith("**texto**");
  });

  test("Itálico wraps selection with *", async () => {
    const { user, onChange, textarea } = await setup("hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^Itálico$/i }));
    expect(onChange).toHaveBeenCalledWith("hello *world*");
  });

  test("Código wraps selection with backticks", async () => {
    const { user, onChange, textarea } = await setup("hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^Código$/i }));
    expect(onChange).toHaveBeenCalledWith("hello `world`");
  });

  test("Lista prefixes current line with -", async () => {
    const { user, onChange } = await setup("item");
    await user.click(screen.getByRole("button", { name: /^Lista$/i }));
    expect(onChange).toHaveBeenCalledWith("- item");
  });
});
