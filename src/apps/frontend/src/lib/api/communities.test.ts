import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getFileYears, getFileTagsByYear, getFilesByYearAndTag, getForums, getCommunityPosts } from "./communities"

// localStorage is not available in this jsdom environment — stub it
vi.stubGlobal("localStorage", {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
})

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ data }), { status }),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

// --- File endpoints ---

describe("getFileYears", () => {
  it("returns unwrapped array of years", async () => {
    mockFetch([2023, 2024, 2025])
    const result = await getFileYears("42")
    expect(result).toEqual([2023, 2024, 2025])
  })

  it("calls the correct endpoint", async () => {
    const spy = mockFetch([])
    await getFileYears("42")
    expect(spy.mock.calls[0][0]).toContain("/forums/42/files/year")
  })

  it("returns empty array when data is null", async () => {
    mockFetch(null)
    const result = await getFileYears("42")
    expect(result).toEqual([])
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "not found" }), { status: 404 }),
    )
    await expect(getFileYears("99")).rejects.toThrow("API 404")
  })
})

describe("getFileTagsByYear", () => {
  const mockTags = [
    { id: 1, name: "Resumos", count: 3 },
    { id: 2, name: "Exercícios", count: 5 },
  ]

  it("returns unwrapped array of tags", async () => {
    mockFetch(mockTags)
    const result = await getFileTagsByYear("42", 2024)
    expect(result).toEqual(mockTags)
  })

  it("calls the correct endpoint with year", async () => {
    const spy = mockFetch([])
    await getFileTagsByYear("42", 2024)
    expect(spy.mock.calls[0][0]).toContain("/forums/42/files/year/2024")
  })

  it("returns empty array when data is null", async () => {
    mockFetch(null)
    const result = await getFileTagsByYear("42", 2024)
    expect(result).toEqual([])
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "server error" }), { status: 500 }),
    )
    await expect(getFileTagsByYear("42", 2024)).rejects.toThrow("API 500")
  })
})

describe("getFilesByYearAndTag", () => {
  const mockRaw = [
    { id: 101, titulo: "Aula 01.pdf", criado_em: "2024-03-15T10:00:00Z" },
    { id: 102, titulo: "Lista 01.pdf", criado_em: "2024-04-01T10:00:00Z" },
  ]
  const mockArrayNames = ["Aula 01.pdf", "Lista 01.pdf"]
  const mockFilesResult = [
    { post_id: 101, title: "Aula 01.pdf", file_url: "/api/posts/101/files", uploaded_at: "2024-03-15T10:00:00Z" },
    { post_id: 102, title: "Lista 01.pdf", file_url: "/api/posts/102/files", uploaded_at: "2024-04-01T10:00:00Z" },
  ]

  it("returns unwrapped array of files", async () => {
    mockFetch({ content: mockRaw, array_names: mockArrayNames })
    const result = await getFilesByYearAndTag("42", 2024, 3)
    expect(result).toEqual(mockFilesResult)
  })

  it("calls the correct endpoint with year and tag id", async () => {
    const spy = mockFetch({ content: [], array_names: [] })
    await getFilesByYearAndTag("42", 2024, 3)
    expect(spy.mock.calls[0][0]).toContain("/forums/42/files/year/2024/tag/3")
  })

  it("returns empty array when content is missing", async () => {
    mockFetch({})
    const result = await getFilesByYearAndTag("42", 2024, 3)
    expect(result).toEqual([])
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "server error" }), { status: 500 }),
    )
    await expect(getFilesByYearAndTag("42", 2024, 3)).rejects.toThrow("API 500")
  })
})

// --- Forum endpoints ---

describe("getForums", () => {
  const mockForums = [
    { id: 1, nome: "Cálculo I", descricao: "Fórum de cálculo", status: "ATIVO" },
    { id: 2, nome: "Física II", descricao: "Fórum de física", status: "ATIVO" },
  ]

  it("returns unwrapped array of forums", async () => {
    mockFetch(mockForums)
    const result = await getForums()
    expect(result).toEqual(mockForums)
  })

  it("calls the correct endpoint", async () => {
    const spy = mockFetch([])
    await getForums()
    expect(spy.mock.calls[0][0]).toContain("/forums/print/forums")
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "server error" }), { status: 500 }),
    )
    await expect(getForums()).rejects.toThrow("API 500")
  })
})

describe("getCommunityPosts", () => {
  const mockRows = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    titulo: `Post ${i + 1}`,
    conteudo: "conteúdo",
    nome_usuario: "user",
    img_perfil: null,
    criado_em: "2024-01-01T00:00:00Z",
    tags: [],
    engajamento: 0,
    comentarios: 0,
    arquivo: null,
  }))

  it("returns mapped posts and computed total", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ data: mockRows, total: mockRows.length }), { status: 200 }),
    )
    const { posts, total } = await getCommunityPosts("1", 1)
    expect(posts).toHaveLength(5)
    expect(total).toBe(5)
  })

  it("calls the correct endpoint with forum id and page", async () => {
    const spy = mockFetch([])
    await getCommunityPosts("7", 3)
    expect(spy.mock.calls[0][0]).toContain("/posts/7/page/3")
  })

  it("maps snake_case fields to Post shape", async () => {
    mockFetch([mockRows[0]])
    const { posts } = await getCommunityPosts("1", 1)
    expect(posts[0]).toMatchObject({
      id: 1,
      titulo: "Post 1",
      nome_usuario: "user",
    })
  })

  it("normalizes tags from objects to strings", async () => {
    mockFetch([{ ...mockRows[0], tags: [{ tag: "cálculo" }, { tag: "integral" }] }])
    const { posts } = await getCommunityPosts("1", 1)
    expect(posts[0].tags).toEqual(["cálculo", "integral"])
  })
})
