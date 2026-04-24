import { render, screen } from "@testing-library/react";
import PostTag from "@/components/post-tag";

describe("PostTag", () => {
  test("renders the tag name", () => {
    render(<PostTag tag={{ id: "calculo-i", name: "Cálculo I" }} />);
    expect(screen.getByText("Cálculo I")).toBeInTheDocument();
  });
  test("displays the name in uppercase", () => {
    render(<PostTag tag={{ id: "calculo-i", name: "Cálculo I" }} />);
    expect(screen.getByText("Cálculo I")).toHaveClass("uppercase");
  });
  test("accepts any string as a name", () => {
    render(<PostTag tag={{ id: "lab-digital", name: "Lab Digital" }} />);
    expect(screen.getByText("Lab Digital")).toBeInTheDocument();
  });
  test("derives text color from tag id", () => {
    render(<PostTag tag={{ id: "calculo-i", name: "Cálculo I" }} />);
    expect(screen.getByText("Cálculo I")).toHaveAttribute(
      "style",
      expect.stringContaining("color"),
    );
  });
  test("same id always produces the same color", () => {
    const { unmount } = render(
      <PostTag tag={{ id: "calculo-i", name: "First" }} />,
    );
    const color1 = screen.getByText("First").style.backgroundColor;
    unmount();
    render(<PostTag tag={{ id: "calculo-i", name: "Second" }} />);
    const color2 = screen.getByText("Second").style.backgroundColor;
    expect(color1).toBe(color2);
  });
});
