import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TabsNavigation from "@/components/tabs-navigation";

describe("TabsNavigation", () => {
  test("renders both tabs", () => {
    render(<TabsNavigation activeTab="forum" onTabChange={() => {}} />);
    expect(screen.getByText("Fórum")).toBeInTheDocument();
    expect(screen.getByText("Arquivos")).toBeInTheDocument();
  });

  test("active tab has accent styling", () => {
    render(<TabsNavigation activeTab="forum" onTabChange={() => {}} />);
    expect(screen.getByText("Fórum")).toHaveClass("text-accent");
  });

  test("inactive tab does not have accent styling", () => {
    render(<TabsNavigation activeTab="forum" onTabChange={() => {}} />);
    expect(screen.getByText("Arquivos")).not.toHaveClass("text-accent");
  });

  test("calls onTabChange with correct tab id when clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<TabsNavigation activeTab="forum" onTabChange={onTabChange} />);
    await user.click(screen.getByText("Arquivos"));
    expect(onTabChange).toHaveBeenCalledWith("arquivos");
  });
});
