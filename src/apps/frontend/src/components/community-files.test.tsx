import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CommunityFiles from "./community-files";

vi.mock("next/navigation", () => ({
  useParams: () => ({ name: "test-community" }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/api/communities", () => ({
  getFileYears: vi.fn(),
  getFileTagsByYear: vi.fn(),
  getFilesByYearAndTag: vi.fn(),
}));

import {
  getFileYears,
  getFileTagsByYear,
  getFilesByYearAndTag,
} from "@/lib/api/communities";

const mockYears = [2024, 2023];
const mockTags = [
  { id: 1, name: "Resumos", count: 3 },
  { id: 2, name: "Exercícios", count: 5 },
];
const mockFiles = [
  { post_id: 101, title: "Aula 01.pdf", file_url: "/files/aula01.pdf", uploaded_at: "2024-03-15T10:00:00Z" },
  { post_id: 102, title: "Lista 01.pdf", file_url: "/files/lista01.pdf", uploaded_at: "2024-04-01T10:00:00Z" },
];

beforeEach(() => {
  vi.clearAllMocks();
  (getFileYears as ReturnType<typeof vi.fn>).mockResolvedValue(mockYears);
  (getFileTagsByYear as ReturnType<typeof vi.fn>).mockResolvedValue(mockTags);
  (getFilesByYearAndTag as ReturnType<typeof vi.fn>).mockResolvedValue(mockFiles);
});

describe("CommunityFiles", () => {
  it("shows loading state initially", () => {
    (getFileYears as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    render(<CommunityFiles forumId="42" />);
    expect(screen.getByText("Carregando anos...")).toBeInTheDocument();
  });

  it("renders year rows after load", async () => {
    render(<CommunityFiles forumId="42" />);
    await waitFor(() => expect(screen.getByText("2024")).toBeInTheDocument());
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("shows empty state when no years", async () => {
    (getFileYears as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<CommunityFiles forumId="empty-99" />);
    await waitFor(() =>
      expect(screen.getByText("Nenhum arquivo disponível ainda.")).toBeInTheDocument()
    );
  });

  it("shows error state on fetch failure", async () => {
    (getFileYears as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network"));
    render(<CommunityFiles forumId="error-88" />);
    await waitFor(() =>
      expect(screen.getByText("Erro ao carregar arquivos.")).toBeInTheDocument()
    );
  });

  it("expands year and shows tags on click", async () => {
    render(<CommunityFiles forumId="42" />);
    await waitFor(() => screen.getByText("2024"));
    fireEvent.click(screen.getByText("2024"));
    await waitFor(() => expect(screen.getByText("Resumos")).toBeInTheDocument());
    expect(screen.getByText("Exercícios")).toBeInTheDocument();
  });

  it("expands tag and shows files on click", async () => {
    render(<CommunityFiles forumId="42" />);
    await waitFor(() => screen.getByText("2024"));
    fireEvent.click(screen.getByText("2024"));
    await waitFor(() => screen.getByText("Resumos"));
    fireEvent.click(screen.getByText("Resumos"));
    await waitFor(() => expect(screen.getByText("Aula 01.pdf")).toBeInTheDocument());
    expect(screen.getByText("Lista 01.pdf")).toBeInTheDocument();
  });

  it("calls getFilesByYearAndTag with tag name not id", async () => {
    render(<CommunityFiles forumId="name-77" />);
    await waitFor(() => screen.getByText("2024"));
    fireEvent.click(screen.getByText("2024"));
    await waitFor(() => screen.getByText("Resumos"));
    fireEvent.click(screen.getByText("Resumos"));
    await waitFor(() =>
      expect(getFilesByYearAndTag).toHaveBeenCalledWith("name-77", 2024, "Resumos")
    );
  });

  it("links files to post detail page", async () => {
    render(<CommunityFiles forumId="42" />);
    await waitFor(() => screen.getByText("2024"));
    fireEvent.click(screen.getByText("2024"));
    await waitFor(() => screen.getByText("Resumos"));
    fireEvent.click(screen.getByText("Resumos"));
    await waitFor(() => screen.getByText("Aula 01.pdf"));
    const link = screen.getByText("Aula 01.pdf").closest("a");
    expect(link?.getAttribute("href")).toBe("/v/test-community/post/101");
  });
});
