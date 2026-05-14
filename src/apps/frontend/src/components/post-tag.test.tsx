import { render, screen } from "@testing-library/react";
import PostTag from "@/components/post-tag";

describe("PostTag", () => {
  test("renders the tag name", () => {
    render(<PostTag tag="Cálculo I" />);
    expect(screen.getByText("Cálculo I")).toBeInTheDocument();
  });
  test("displays the name in uppercase", () => {
    render(<PostTag tag="Cálculo I" />);
    expect(screen.getByText("Cálculo I")).toHaveClass("uppercase");
  });
  test("accepts any string as a name", () => {
    render(<PostTag tag="Lab Digital" />);
    expect(screen.getByText("Lab Digital")).toBeInTheDocument();
  });
  test("derives text color from tag name", () => {
    render(<PostTag tag="Cálculo I" />);
    expect(screen.getByText("Cálculo I")).toHaveAttribute(
      "style",
      expect.stringContaining("color"),
    );
  });
  test("same name always produces the same color", () => {
    const { unmount } = render(<PostTag tag="Cálculo I" />);
    const color1 = screen.getByText("Cálculo I").style.color;
    unmount();
    render(<PostTag tag="Cálculo I" />);
    const color2 = screen.getByText("Cálculo I").style.color;
    expect(color1).toBe(color2);
  });
});
