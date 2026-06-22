# AGENTS.md

## Project

Spotlite

A platform for collecting information through forms and automatically generating branded graphics.

---

## Tech Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* React Hook Form
* React Konva
* TanStack React Query

Backend:

* Elysia (mounted inside Next.js at app/api/[[...slugs]])
* TypeScript

Database:

* PostgreSQL (Neon)

ORM:

* Drizzle ORM

Authentication:

* Clerk

Storage:

* AWS S3 (or Cloudflare R2)

Image Generation:

* Satori
* Resvg

---

## Architecture Rules

### General

1. Frontend and Backend must be separated at the code level.
2. Business logic belongs in the backend (`lib/api/`).
3. Database access must go through repositories/services.
4. Never place SQL inside UI components.
5. All forms must use Zod validation.
6. Dynamic form schemas must be stored as JSON.
7. Template layouts must be stored as JSON.
8. Generated images must be stored in object storage.

---

### Backend Architecture

Spotlite uses Elysia mounted inside Next.js at `app/api/[[...slugs]]/route.ts`.

Backend logic lives in `lib/api/` and is organized into modules.

Every feature must live inside its own module.

Modules:

* auth
* projects
* forms
* submissions
* templates
* image-generation

Recommended structure:

```text
lib/
└── api/
    ├── index.ts          ← Elysia app entry, mounts all modules
    └── modules/
        ├── auth/
        ├── projects/
        ├── forms/
        ├── submissions/
        ├── templates/
        └── image-generation/
```

Each module should contain:

* routes.ts
* service.ts
* repository.ts
* schema.ts
* types.ts

Rules:

1. Routes should be thin.
2. Business logic belongs in services.
3. Database logic belongs in repositories.
4. Modules should not access another module's database tables directly.
5. Shared utilities belong in `lib/shared/`.
6. Every new feature must be implemented as a module.
7. Avoid large files (>300 lines) whenever possible.
8. Prefer composition over tightly coupled modules.

---

### Frontend Architecture

Frontend uses Next.js App Router. Data fetching is done exclusively via TanStack React Query in client components.

```text
app/
├── api/
│   └── [[...slugs]]/
│       └── route.ts     ← mounts Elysia
├── (auth)/              ← Clerk auth pages
├── (public)/            ← landing, demo, public forms
└── dashboard/           ← authenticated app
```

Feature-specific components and hooks live in:

```text
features/
├── projects/
├── forms/
├── submissions/
├── templates/
└── image-generation/
```

Shared UI components belong in:

```text
components/
```

Shared utilities belong in:

```text
lib/
```

---

## MVP Rules

Build only:

* Authentication
* Projects
* Form Builder
* Form Submissions
* Template Editor
* Image Generation
* Image Downloads

---

## Explicitly Forbidden During MVP

Do NOT build:

* WhatsApp Integration
* Scheduling
* Analytics
* Team Collaboration
* Payments
* AI Template Generation
* Template Marketplace
* Bulk Generation
* Notifications
* Public APIs

---

## UI Rules

1. Mobile-first.
2. Accessible.
3. Support Light Mode.
4. Support Dark Mode.
5. Use reusable components.
6. Avoid unnecessary animations.

---

## Code Quality

1. Strict TypeScript.
2. No `any` types.
3. Shared types between frontend and backend via `lib/types/`.
4. Small reusable functions.
5. Clear folder structure.

---

## Success Definition

A user can:

* Create a project
* Create a form
* Collect submissions
* Create a template
* Generate a graphic
* Download a graphic

If these work, MVP is complete.

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
