import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavBar from "@/components/navbar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/auth", () => ({
  getMe: vi.fn().mockRejectedValue(new Error("not logged in")),
  logout: vi.fn(),
}));

describe("NavBar", () => {
  test("renders the brand name", () => {
    render(<NavBar />);
    expect(screen.getByText("PUCVault")).toBeInTheDocument();
  });
  test("brand link navigates to /", () => {
    render(<NavBar />);
    const link = screen.getByRole("link", { name: /pucvault/i });
    expect(link.getAttribute("href")).toBe("/");
  });
  test("shows login link when logged out", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: /entrar/i })).toBeInTheDocument();
  });
  test("search bar accepts user input", async () => {
    const user = userEvent.setup();
    render(<NavBar />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "test");
    expect(input).toHaveValue("test");
  });
});
