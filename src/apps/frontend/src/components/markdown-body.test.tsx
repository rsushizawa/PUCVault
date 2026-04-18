import { render, screen } from "@testing-library/react";
import MarkdownBody from "@/components/markdown-body";

describe("MarkdownBody", () => {
  test("renders plain text", () => {
    render(<MarkdownBody>Hello world</MarkdownBody>);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  test("renders bold text as strong element", () => {
    render(<MarkdownBody>{"**bold**"}</MarkdownBody>);
    const el = screen.getByText("bold");
    expect(el.tagName).toBe("STRONG");
  });

  test("renders italic text as em element", () => {
    render(<MarkdownBody>{"*italic*"}</MarkdownBody>);
    const el = screen.getByText("italic");
    expect(el.tagName).toBe("EM");
  });

  test("renders a link with correct href", () => {
    render(<MarkdownBody>{"[click here](https://example.com)"}</MarkdownBody>);
    const link = screen.getByRole("link", { name: "click here" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  test("renders links with target _blank", () => {
    render(<MarkdownBody>{"[link](https://example.com)"}</MarkdownBody>);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  test("renders h1 heading", () => {
    render(<MarkdownBody>{"# Title"}</MarkdownBody>);
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
  });

  test("renders h2 heading", () => {
    render(<MarkdownBody>{"## Section"}</MarkdownBody>);
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toBeInTheDocument();
  });

  test("renders h3 heading", () => {
    render(<MarkdownBody>{"### Sub-section"}</MarkdownBody>);
    expect(screen.getByRole("heading", { level: 3, name: "Sub-section" })).toBeInTheDocument();
  });

  test("renders unordered list items", () => {
    render(<MarkdownBody>{`- first item\n- second item`}</MarkdownBody>);
    expect(screen.getByText("first item")).toBeInTheDocument();
    expect(screen.getByText("second item")).toBeInTheDocument();
  });

  test("renders ordered list items", () => {
    render(<MarkdownBody>{`1. alpha\n2. beta`}</MarkdownBody>);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
  });

  test("renders blockquote text", () => {
    render(<MarkdownBody>{"> quoted text"}</MarkdownBody>);
    expect(screen.getByText("quoted text")).toBeInTheDocument();
    expect(screen.getByText("quoted text").closest("blockquote")).toBeInTheDocument();
  });

  test("renders inline code", () => {
    render(<MarkdownBody>{"use `console.log` here"}</MarkdownBody>);
    expect(screen.getByText("console.log")).toBeInTheDocument();
    expect(screen.getByText("console.log").tagName).toBe("CODE");
  });

  test("renders strikethrough via remark-gfm", () => {
    render(<MarkdownBody>{"~~crossed out~~"}</MarkdownBody>);
    expect(screen.getByText("crossed out")).toBeInTheDocument();
    expect(screen.getByText("crossed out").tagName).toBe("DEL");
  });

  test("applies custom className to wrapper", () => {
    const { container } = render(
      <MarkdownBody className="custom-class">text</MarkdownBody>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
