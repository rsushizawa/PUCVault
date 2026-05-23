# PUC Vault

## Description

Academic resource platform for PUC Campinas. Students can join communities (disciplinas), share forum posts, upload study files, and organize resources by semester.

## Technologies Used

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (stored procedures and functions via `publico.*` schema)
- **Storage:** Cloudinary (file and image uploads)
- **Auth:** JWT

## Project Structure

```
/
├── src/
│   └── apps/
│       ├── api-server/          → Express REST API
│       │   ├── controllers/     → Request handlers
│       │   ├── services/        → Business logic
│       │   ├── routes/          → Route definitions
│       │   ├── middlewares/     → Auth, upload, error handling
│       │   └── config/          → DB connection, env config
│       └── frontend/            → Next.js web app
│           └── src/
│               ├── app/         → Pages and routes (App Router)
│               ├── components/  → Reusable UI components
│               ├── lib/api/     → Typed API client layer
│               └── types/       → Shared TypeScript types
├── database/                    → SQL scripts (tables, views, functions, procedures)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+

### Backend

```bash
cd src/apps/api-server
npm install
npm start
```

Set environment variables (see `src/apps/api-server/config/`): `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`, `CLOUDINARY_*`.

### Frontend

```bash
cd src/apps/frontend
npm install
npm run dev     # Dev server at http://localhost:3000
npm run build   # Production build
npm run lint    # ESLint
npm run test    # All tests (Vitest)
```

Set `NEXT_PUBLIC_API_URL` to point at the backend (defaults to `http://localhost:8000`).

### Database

Apply scripts in this order:

1. `database/pucvaultscr.sql` — full schema (tables, views, functions, procedures)

Or apply individually:

```
database/createtablescr.sql
database/createviewscr.sql
database/createfunctionscr.sql
database/createprocedurescr.sql
```

## Team Members

| Name                           | Role                     |
| ------------------------------ | ------------------------ |
| Rodrigo Seiji Yugoshi Ushizawa | Full-stack               |
| Daniel Wu                      | Backend                  |
| Carlos Nascimento              | Database                 |
| Guilherme                      | Database + Documentation |
| Gabriel Catuzo                 | Backend                  |
