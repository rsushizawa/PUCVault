import { describe, it, expect, vi, afterEach } from "vitest"
import { getForumTags, searchTags, createTag, deleteForumTag } from "./tags"

// localStorage is not available in this jsdom environment — stub it
vi.stubGlobal("localStorage", {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
})

const mockTag = { id: 1, tag: "cálculo", status: "ATIVO", total_usos: "12", relevancia: 0.9 }

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({ data }), { status }),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("getForumTags", () => {
  it("returns unwrapped array of tags", async () => {
    mockFetch([mockTag])
    const result = await getForumTags("5")
    expect(result).toEqual([mockTag])
  })

  it("calls the correct endpoint", async () => {
    const spy = mockFetch([])
    await getForumTags("5")
    expect(spy.mock.calls[0][0]).toContain("/tags/forum/5")
  })

  it("returns empty array when no tags", async () => {
    mockFetch([])
    const result = await getForumTags("5")
    expect(result).toEqual([])
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "not found" }), { status: 404 }),
    )
    await expect(getForumTags("99")).rejects.toThrow("API 404")
  })
})

describe("searchTags", () => {
  it("returns matching tags", async () => {
    mockFetch([mockTag])
    const result = await searchTags("calc", "5")
    expect(result).toEqual([mockTag])
  })

  it("URL-encodes the query string", async () => {
    const spy = mockFetch([])
    await searchTags("cálculo diferencial", "5")
    expect(spy.mock.calls[0][0]).toContain(encodeURIComponent("cálculo diferencial"))
  })

  it("calls the correct endpoint", async () => {
    const spy = mockFetch([])
    await searchTags("mat", "5")
    expect(spy.mock.calls[0][0]).toContain("/tags/search?q=mat")
  })

  it("returns empty array when no matches", async () => {
    mockFetch([])
    const result = await searchTags("xyznotfound", "5")
    expect(result).toEqual([])
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "server error" }), { status: 500 }),
    )
    await expect(searchTags("calc", "5")).rejects.toThrow("API 500")
  })
})

describe("createTag", () => {
  it("returns the found tag after creation", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [mockTag] }), { status: 200 }))
    const result = await createTag("cálculo")
    expect(result).toEqual(mockTag)
  })

  it("returns a fallback tag when search finds nothing", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
    const result = await createTag("nova-tag")
    expect(result).toMatchObject({ tag: "nova-tag", status: "ATIVO" })
  })

  it("posts to the correct endpoint", async () => {
    const spy = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [] }), { status: 200 }))
    await createTag("integral")
    expect(spy.mock.calls[0][0]).toContain("/tags/create")
    expect(spy.mock.calls[0][1]).toMatchObject({ method: "POST" })
  })

  it("throws when the creation POST fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "forbidden" }), { status: 403 }),
    )
    await expect(createTag("bad-tag")).rejects.toThrow("API 403")
  })
})

describe("deleteForumTag", () => {
  it("sends DELETE to the correct endpoint", async () => {
    const spy = mockFetch(null)
    await deleteForumTag("5", 3)
    expect(spy.mock.calls[0][0]).toContain("/tags/forum/5/3")
    expect(spy.mock.calls[0][1]).toMatchObject({ method: "DELETE" })
  })

  it("resolves without error on success", async () => {
    mockFetch(null)
    await expect(deleteForumTag("5", 3)).resolves.not.toThrow()
  })

  it("throws on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "not found" }), { status: 404 }),
    )
    await expect(deleteForumTag("5", 99)).rejects.toThrow("API 404")
  })
})
