import { render, screen } from "@testing-library/react";
import PostTag from "@/components/post-tag";

describe("PostTag", () => {
  test("renders the label text", () => {
    render(<PostTag label="Cálculo I"></PostTag>);
    expect(screen.getByText("Cálculo I")).toBeInTheDocument();
  });
  test("displays the label in uppercase", () => {
    render(<PostTag label="Cálculo I"></PostTag>);
    expect(screen.getByText("Cálculo I")).toHaveClass("uppercase");
  });
  test("accepts any string as a label", () => {
    render(<PostTag label="Lab Digital"></PostTag>);
    expect(screen.getByText("Lab Digital")).toBeInTheDocument();
  });
  test("applies background color from color prop", () => {
    render(<PostTag label="Cálculo I" color="rgba(2,84,134,0.3)"></PostTag>);
    expect(screen.getByText("Cálculo I")).toHaveStyle(
      "background-color: rgba(2,84,134,0.3)",
    );
  });
});
