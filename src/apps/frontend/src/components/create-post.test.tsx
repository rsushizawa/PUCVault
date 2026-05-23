import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePost from "@/components/create-post";

vi.mock("@/lib/api/auth", () => ({
  getMe: vi.fn().mockResolvedValue({ id: "u1", nome_usuario: "user", img_perfil: null }),
  logout: vi.fn(),
}));

vi.mock("@/lib/api/tags", () => ({
  getTags: vi.fn().mockResolvedValue([
    { id: 1, tag: "question", cor: "#ff0000" },
    { id: 2, tag: "resource", cor: "#00ff00" },
    { id: 3, tag: "discussion", cor: "#0000ff" },
  ]),
  searchTags: vi.fn().mockResolvedValue([]),
}));

const defaultProps = {
  forumId: "test-forum",
  onPost: vi.fn(),
};

async function expandPost(mode: "post" | "comment" = "post") {
  const user = userEvent.setup();
  render(<CreatePost {...defaultProps} mode={mode} />);
  const barText = mode === "comment"
    ? /adicionar um comentário/i
    : /Faça uma pergunta/i;
  await user.click(screen.getByRole("button", { name: barText }));
  return user;
}

describe("CreatePost", () => {
  test("renders collapsed bar by default", () => {
    render(<CreatePost {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /Faça uma pergunta ou compartilhe um insight/i }),
    ).toBeInTheDocument();
  });

  test("expands when the collapsed bar is clicked", async () => {
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /Faça uma pergunta/i }));
    expect(screen.getByPlaceholderText("Título do post")).toBeInTheDocument();
  });

  test("calls onPost when Publicar is clicked with title and content", async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps} onPost={onPost} />);
    await user.click(screen.getByRole("button", { name: /Faça uma pergunta/i }));
    await user.type(screen.getByPlaceholderText("Título do post"), "My title");
    await user.type(screen.getByPlaceholderText(/Detalhe sua pergunta/i), "hello");
    await user.click(screen.getByRole("button", { name: /publicar/i }));
    await waitFor(() => expect(onPost).toHaveBeenCalled());
    expect(onPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My title", content: "hello" }),
    );
  });

  test("collapses back when Cancelar is clicked", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.queryByPlaceholderText("Título do post")).not.toBeInTheDocument();
  });
});

describe("CreatePost tag selection", () => {
  test("renders tag pills when expanded", async () => {
    await expandPost();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /question/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /resource/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /discussion/i })).toBeInTheDocument();
  });

  test("clicking a tag pill adds it to selection", async () => {
    await expandPost();
    await waitFor(() => screen.getByRole("button", { name: /resource/i }));
    await userEvent.click(screen.getByRole("button", { name: /resource/i }));
    expect(screen.getByRole("button", { name: /resource/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("clicking a selected tag deselects it", async () => {
    await expandPost();
    await waitFor(() => screen.getByRole("button", { name: /resource/i }));
    await userEvent.click(screen.getByRole("button", { name: /resource/i }));
    await userEvent.click(screen.getByRole("button", { name: /resource/i }));
    expect(screen.getByRole("button", { name: /resource/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("onPost is called with selected tags", async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CreatePost {...defaultProps} onPost={onPost} />);
    await user.click(screen.getByRole("button", { name: /Faça uma pergunta/i }));
    await user.type(screen.getByPlaceholderText("Título do post"), "title");
    await waitFor(() => screen.getByRole("button", { name: /resource/i }));
    await user.click(screen.getByRole("button", { name: /resource/i }));
    await user.click(screen.getByRole("button", { name: /publicar/i }));
    await waitFor(() => expect(onPost).toHaveBeenCalled());
    const call = onPost.mock.calls[0][0];
    expect(call.tags).toHaveLength(1);
    expect(call.tags[0].tag).toBe("resource");
  });
});

describe("CreatePost toolbar", () => {
  function textarea() {
    return screen.getByPlaceholderText(/Detalhe sua pergunta/i) as HTMLTextAreaElement;
  }

  test("toolbar is not visible when collapsed", () => {
    render(<CreatePost {...defaultProps} />);
    expect(screen.queryByRole("button", { name: /negrito/i })).not.toBeInTheDocument();
  });

  test("toolbar renders when expanded", async () => {
    await expandPost();
    expect(screen.getByRole("button", { name: /negrito/i })).toBeInTheDocument();
  });

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
  ] as [string, RegExp][])("toolbar has %s button", async (_label, pattern) => {
    await expandPost();
    expect(screen.getByRole("button", { name: pattern })).toBeInTheDocument();
  });

  test("negrito wraps selection with **", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^negrito$/i }));
    expect(textarea().value).toBe("hello **world**");
  });

  test("negrito inserts placeholder when nothing is selected", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /^negrito$/i }));
    expect(textarea().value).toBe("**texto**");
  });

  test("itálico wraps selection with *", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^itálico$/i }));
    expect(textarea().value).toBe("hello *world*");
  });

  test("link wraps selection as [text](url)", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^link$/i }));
    expect(textarea().value).toBe("hello [world](url)");
  });

  test("tachado wraps selection with ~~", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^tachado$/i }));
    expect(textarea().value).toBe("hello ~~world~~");
  });

  test("código wraps selection with backticks", async () => {
    const user = await expandPost();
    await user.type(textarea(), "hello world");
    textarea().setSelectionRange(6, 11);
    await user.click(screen.getByRole("button", { name: /^código$/i }));
    expect(textarea().value).toBe("hello `world`");
  });

  test("lista prefixes current line with -", async () => {
    const user = await expandPost();
    await user.type(textarea(), "item");
    await user.click(screen.getByRole("button", { name: /^lista$/i }));
    expect(textarea().value).toBe("- item");
  });

  test("lista numerada prefixes current line with 1.", async () => {
    const user = await expandPost();
    await user.type(textarea(), "item");
    await user.click(screen.getByRole("button", { name: /lista numerada/i }));
    expect(textarea().value).toBe("1. item");
  });

  test("citação prefixes current line with >", async () => {
    const user = await expandPost();
    await user.type(textarea(), "item");
    await user.click(screen.getByRole("button", { name: /citação/i }));
    expect(textarea().value).toBe("> item");
  });

  test("imagem wraps selection as ![alt](url)", async () => {
    const user = await expandPost();
    await user.type(textarea(), "photo");
    textarea().setSelectionRange(0, 5);
    await user.click(screen.getByRole("button", { name: /imagem/i }));
    expect(textarea().value).toBe("![photo](url)");
  });
});

describe("CreatePost tag picker", () => {
  test("shows Adicionar tag button when expanded", async () => {
    await expandPost();
    expect(screen.getByRole("button", { name: /adicionar tag/i })).toBeInTheDocument();
  });

  test("clicking Adicionar tag opens search dropdown", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /adicionar tag/i }));
    expect(screen.getByPlaceholderText("Buscar tag...")).toBeInTheDocument();
  });

  test("pressing Escape closes dropdown", async () => {
    const user = await expandPost();
    await user.click(screen.getByRole("button", { name: /adicionar tag/i }));
    await user.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText("Buscar tag...")).not.toBeInTheDocument();
  });
});
