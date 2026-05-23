# PUC Vault — Frontend

Academic resource platform for PUC Campinas. Communities (disciplinas) host forum posts and file repositories organized by semester.

## Getting Started

```bash
npm install
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm run test       # All tests (Vitest)
npx vitest run src/components/post-card.test.tsx  # Single test file
```

Set `NEXT_PUBLIC_API_URL` to point at the backend (defaults to `http://localhost:8000`).

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vitest + Testing Library · react-markdown v10

### Directory layout

```
src/
  app/
    community/[id]/
      page.tsx              # Community view (forum + files tabs)
      post/[postId]/
        page.tsx            # Post detail page
    layout.tsx              # Root layout (Inter font, globals)
    page.tsx                # Landing page
  components/               # All UI components, each co-located with .test.tsx
  lib/
    api/
      client.ts             # Base fetch wrapper + auth token helpers
      auth.ts               # Login/register calls
      communities.ts        # Community + posts/files listing
      posts.ts              # Post CRUD, comments, votes
    file-grouping.ts        # Groups file arrays into semester buckets
    tag-colors.ts           # Deterministic HSL color from tag ID
  types/
    api.ts                  # Shared API response types
    tag.ts                  # Tag interface
  test/
    setup.ts                # Vitest + jsdom global setup
```

### API client layer

`src/lib/api/client.ts` wraps `fetch` with:
- Base URL from `NEXT_PUBLIC_API_URL`
- `Authorization: Bearer <token>` injected from `localStorage` on every request
- Typed generic `apiFetch<T>` — callers pass the expected return type, no casting needed

Domain modules (`communities.ts`, `posts.ts`, `auth.ts`) import `apiFetch` and export strongly-typed functions. Pages and components import only the domain functions — never `apiFetch` directly.

### Design tokens

Tailwind CSS v4 `@theme` variables are declared in `src/app/globals.css`. Always use semantic token names:

| Token | Purpose |
|---|---|
| `bg-surface-base` | Page background |
| `text-text-primary` | Body text |
| `text-text-secondary` | Supporting text |
| `text-text-muted` | Timestamps, metadata |
| `bg-accent` | Brand accent |

Never use raw hex or `hsl()` values in component classes.

### Comment tree

The API returns comments **pre-nested** as a recursive tree (not a flat array). `Comment.children` contains child comments at any depth, capped at level 5 by a DB constraint. The `CommentNode` component renders itself recursively — no client-side flattening or re-nesting is needed.

### Markdown

All user-authored content (post bodies, comments) is written in a `MarkdownEditor` (write/preview tabs) and rendered by `MarkdownBody` (react-markdown v10 + remark-gfm). Both components are self-contained and reusable anywhere.

### Tag colors

`getTagColor(tagId)` maps any tag ID to a deterministic HSL color via a djb2-style hash. Memoized in a module-level `Map`. No tag color list to maintain.

## Building on this architecture

### Add a new page

1. Create `src/app/<route>/page.tsx`.
2. Fetch data by importing from `src/lib/api/` — add a new domain function if needed.
3. Mark components that use hooks or `localStorage` with `"use client"`.

### Add a new API endpoint

1. Add the typed function to the relevant domain module in `src/lib/api/` (or create a new one).
2. Call `apiFetch<YourType>(path, options)` — add the response type to `src/types/api.ts` if it's shared.

### Add a new component

1. Create `src/components/my-component.tsx`.
2. Create `src/components/my-component.test.tsx` alongside it.
3. Use semantic design tokens from `globals.css`, `lucide-react` for icons, and `getTagColor` for any tag-coloring needs.

### Add a new type

Shared API response shapes go in `src/types/api.ts`. UI-only prop types are defined inline in the component file.
