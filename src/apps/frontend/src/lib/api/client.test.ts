import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { apiFetch, apiFetchPaginated, apiFormData, setToken, clearToken } from "./client"

const BASE_URL = "http://localhost:8000"

// localStorage is not available in this jsdom environment — stub it
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
vi.stubGlobal("localStorage", localStorageMock)

function mockFetch(data: unknown, status = 200) {
  return vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(data), { status }),
  )
}

beforeEach(() => {
  localStorageMock.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("apiFetch", () => {
  it("unwraps the data envelope", async () => {
    mockFetch({ data: [1, 2, 3] })
    const result = await apiFetch<number[]>("/test")
    expect(result).toEqual([1, 2, 3])
  })

  it("sends request to the correct URL", async () => {
    const spy = mockFetch({ data: null })
    await apiFetch("/some/path")
    expect(spy).toHaveBeenCalledWith(`${BASE_URL}/some/path`, expect.any(Object))
  })

  it("includes Content-Type header", async () => {
    const spy = mockFetch({ data: null })
    await apiFetch("/test")
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers["Content-Type"]).toBe("application/json")
  })

  it("includes Authorization header when token is set", async () => {
    setToken("tok123")
    const spy = mockFetch({ data: null })
    await apiFetch("/test")
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers["Authorization"]).toBe("Bearer tok123")
  })

  it("omits Authorization header when no token", async () => {
    clearToken()
    const spy = mockFetch({ data: null })
    await apiFetch("/test")
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers["Authorization"]).toBeUndefined()
  })

  it("throws on non-ok response", async () => {
    mockFetch({ error: "not found" }, 404)
    await expect(apiFetch("/test")).rejects.toThrow("API 404: /test")
  })

  it("throws on 500", async () => {
    mockFetch({ error: "server error" }, 500)
    await expect(apiFetch("/test")).rejects.toThrow("API 500: /test")
  })

  it("forwards RequestInit options", async () => {
    const spy = mockFetch({ data: null })
    await apiFetch("/test", { method: "POST", body: JSON.stringify({ x: 1 }) })
    expect(spy.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ x: 1 }) })
  })
})

describe("apiFetchPaginated", () => {
  it("returns data array and total from envelope", async () => {
    mockFetch({ data: ["a", "b"], total: 42 })
    const result = await apiFetchPaginated<string>("/test")
    expect(result).toEqual({ data: ["a", "b"], total: 42 })
  })

  it("includes Authorization header when token is set", async () => {
    setToken("tok456")
    const spy = mockFetch({ data: [], total: 0 })
    await apiFetchPaginated("/test")
    const headers = spy.mock.calls[0][1]?.headers as Record<string, string>
    expect(headers["Authorization"]).toBe("Bearer tok456")
  })

  it("throws on non-ok response", async () => {
    mockFetch({ error: "unauthorized" }, 401)
    await expect(apiFetchPaginated("/test")).rejects.toThrow("API 401: /test")
  })
})

describe("apiFormData", () => {
  it("unwraps the data envelope", async () => {
    mockFetch({ data: { file_id: "abc123" } })
    const form = new FormData()
    const result = await apiFormData<{ file_id: string }>("/upload", form, "POST")
    expect(result).toEqual({ file_id: "abc123" })
  })

  it("sends the form body without Content-Type header", async () => {
    const spy = mockFetch({ data: null })
    const form = new FormData()
    await apiFormData("/upload", form)
    const init = spy.mock.calls[0][1]
    expect(init?.body).toBe(form)
    const headers = init?.headers as Record<string, string> | undefined
    expect(headers?.["Content-Type"]).toBeUndefined()
  })

  it("uses PATCH as default method", async () => {
    const spy = mockFetch({ data: null })
    await apiFormData("/upload", new FormData())
    expect(spy.mock.calls[0][1]).toMatchObject({ method: "PATCH" })
  })

  it("throws on non-ok response", async () => {
    mockFetch({ error: "bad request" }, 400)
    await expect(apiFormData("/upload", new FormData())).rejects.toThrow("API 400: /upload")
  })
})
