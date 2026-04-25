import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CommunityFiles from "./community-files";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-community" }),
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

const mockSemesters = [
  {
    id: "s1",
    name: "1º Semestre",
    courses: [
      {
        id: "c1",
        name: "Introduction to Programming",
        files: [
          {
            id: "f1",
            name: "Aula 01 - Intro.pdf",
            uploadedAt: "2024-03-15",
            tags: [{ id: "lecture", name: "lecture" }],
            postId: "post-1",
          },
          {
            id: "f2",
            name: "Exercícios 01.pdf",
            uploadedAt: "2024-02-10",
            tags: [{ id: "exercise", name: "exercise" }],
            postId: "post-2",
          },
        ],
      },
      {
        id: "c2",
        name: "Calculus I",
        files: [
          {
            id: "f3",
            name: "Resumo Derivadas.pdf",
            uploadedAt: "2024-03-20",
            tags: [{ id: "summary", name: "summary" }],
            postId: "post-3",
          },
        ],
      },
    ],
  },
  {
    id: "s2",
    name: "2º Semestre",
    courses: [
      {
        id: "c3",
        name: "Data Structures",
        files: [
          {
            id: "f4",
            name: "Lista 1.pdf",
            uploadedAt: "2024-04-01",
            tags: [{ id: "exercise", name: "exercise" }],
            postId: "post-4",
          },
        ],
      },
    ],
  },
];

describe("CommunityFiles", () => {
  it("renders the Community Files heading", () => {
    render(<CommunityFiles semesters={mockSemesters} />);
    expect(
      screen.getByRole("heading", { name: "Community Files" }),
    ).toBeInTheDocument();
  });

  it("renders a Filter button", () => {
    render(<CommunityFiles semesters={mockSemesters} />);
    expect(screen.getByRole("button", { name: /filter/i })).toBeInTheDocument();
  });

  it("renders all semester names", () => {
    render(<CommunityFiles semesters={mockSemesters} />);
    expect(screen.getByText("1º Semestre")).toBeInTheDocument();
    expect(screen.getByText("2º Semestre")).toBeInTheDocument();
  });

  it("renders course count and total file count for each semester", () => {
    render(<CommunityFiles semesters={mockSemesters} />);
    expect(screen.getByText("2 Courses • 3 Files")).toBeInTheDocument();
    expect(screen.getByText("1 Courses • 1 Files")).toBeInTheDocument();
  });

  describe("semester accordion", () => {
    it("hides courses by default", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      expect(
        screen.queryByText("Introduction to Programming"),
      ).not.toBeInTheDocument();
    });

    it("expands to show courses when clicked", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      expect(
        screen.getByText("Introduction to Programming"),
      ).toBeInTheDocument();
      expect(screen.getByText("Calculus I")).toBeInTheDocument();
    });

    it("collapses when clicked again", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      const semesterBtn = screen.getByRole("button", { name: /1º Semestre/i });
      fireEvent.click(semesterBtn);
      fireEvent.click(semesterBtn);
      expect(
        screen.queryByText("Introduction to Programming"),
      ).not.toBeInTheDocument();
    });

    it("sets aria-expanded correctly on toggle", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      const semesterBtn = screen.getByRole("button", { name: /1º Semestre/i });
      expect(semesterBtn).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(semesterBtn);
      expect(semesterBtn).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("course accordion", () => {
    it("hides files by default inside an open semester", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      expect(
        screen.queryByText("Aula 01 - Intro.pdf"),
      ).not.toBeInTheDocument();
    });

    it("expands to show files when clicked", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );
      expect(screen.getByText("Aula 01 - Intro.pdf")).toBeInTheDocument();
      expect(screen.getByText("Exercícios 01.pdf")).toBeInTheDocument();
    });

    it("shows file tags when a course is expanded", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );
      expect(screen.getByText("lecture")).toBeInTheDocument();
      expect(screen.getByText("exercise")).toBeInTheDocument();
    });

    it("file names link to their post", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );
      expect(
        screen.getByRole("link", { name: "Aula 01 - Intro.pdf" }),
      ).toHaveAttribute("href", "/v/test-community/post/post-1");
    });

    it("collapses course when clicked again", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      const courseBtn = screen.getByRole("button", {
        name: /Introduction to Programming/i,
      });
      fireEvent.click(courseBtn);
      fireEvent.click(courseBtn);
      expect(
        screen.queryByText("Aula 01 - Intro.pdf"),
      ).not.toBeInTheDocument();
    });
  });

  describe("default mode", () => {
    it("starts in default mode (no sort group labels visible)", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );
      expect(screen.queryByText("2024")).not.toBeInTheDocument();
    });

    it("shows files in alphabetical order in default mode", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );

      const fileEls = screen
        .getAllByRole("listitem")
        .filter((el) => el.textContent?.includes(".pdf"));

      const introIdx = fileEls.findIndex((el) =>
        el.textContent?.includes("Aula 01 - Intro.pdf"),
      );
      const exerciseIdx = fileEls.findIndex((el) =>
        el.textContent?.includes("Exercícios 01.pdf"),
      );
      expect(introIdx).toBeLessThan(exerciseIdx);
    });
  });

  describe("sort / filter dropdown", () => {
    it("shows all three sort options when Filter button is clicked", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /filter/i }));
      expect(screen.getByText("Default")).toBeInTheDocument();
      expect(screen.getByText("By Date")).toBeInTheDocument();
      expect(screen.getByText("By Tag")).toBeInTheDocument();
    });

    it("closes the dropdown after selecting a sort option", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /filter/i }));
      fireEvent.click(screen.getByText("By Date"));
      expect(screen.queryByText("By Tag")).not.toBeInTheDocument();
    });

    it("groups files by year when 'By Date' is selected", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /filter/i }));
      fireEvent.click(screen.getByText("By Date"));
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );
      expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("sorts files within a year group newest-first when 'By Date' is selected", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /filter/i }));
      fireEvent.click(screen.getByText("By Date"));
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );

      const fileEls = screen
        .getAllByRole("listitem")
        .filter((el) => el.textContent?.includes(".pdf"));

      const introIdx = fileEls.findIndex((el) =>
        el.textContent?.includes("Aula 01 - Intro.pdf"),
      );
      const exerciseIdx = fileEls.findIndex((el) =>
        el.textContent?.includes("Exercícios 01.pdf"),
      );
      expect(introIdx).toBeLessThan(exerciseIdx);
    });

    it("groups files by tag and shows group labels when 'By Tag' is selected", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /filter/i }));
      fireEvent.click(screen.getByText("By Tag"));
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );
      expect(screen.getAllByText("exercise").length).toBeGreaterThan(0);
      expect(screen.getAllByText("lecture").length).toBeGreaterThan(0);
    });

    it("sorts files by first tag alphabetically when 'By Tag' is selected", () => {
      render(<CommunityFiles semesters={mockSemesters} />);
      fireEvent.click(screen.getByRole("button", { name: /filter/i }));
      fireEvent.click(screen.getByText("By Tag"));
      fireEvent.click(screen.getByRole("button", { name: /1º Semestre/i }));
      fireEvent.click(
        screen.getByRole("button", { name: /Introduction to Programming/i }),
      );

      const fileEls = screen
        .getAllByRole("listitem")
        .filter((el) => el.textContent?.includes(".pdf"));

      const introIdx = fileEls.findIndex((el) =>
        el.textContent?.includes("Aula 01 - Intro.pdf"),
      );
      const exerciseIdx = fileEls.findIndex((el) =>
        el.textContent?.includes("Exercícios 01.pdf"),
      );
      // "exercise" < "lecture" → Exercícios group before Intro group
      expect(exerciseIdx).toBeLessThan(introIdx);
    });
  });
});
