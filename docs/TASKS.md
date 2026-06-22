# TASKS.md

# Spotlite MVP Roadmap

## Goal

Build a platform that allows users to:

1. Create a project
2. Build a dynamic form
3. Collect submissions
4. Create a graphic template
5. Generate graphics automatically
6. Download generated graphics

---

# Phase 1 — Foundation [COMPLETED]

## Goal

Set up the application architecture and development environment.

## Deliverables

* Next.js application
* Elysia API
* TypeScript configuration
* Tailwind CSS
* Clerk authentication
* Neon PostgreSQL
* Drizzle ORM
* Shared environment configuration

## Definition of Done

* Application runs locally
* Database connects successfully
* Authentication works
* User can sign in and sign out

---

# Phase 2 — Database & Core Models [COMPLETED]

## Goal

Create the data foundation.

## Deliverables

* Users table
* Projects table
* Forms table
* Submissions table
* Templates table
* Generated Images table

## Definition of Done

* Migrations run successfully
* Relationships are working
* Seed data can be inserted

---

# Phase 3 — Dashboard & Projects

## Goal

Allow authenticated users to manage projects.

## Deliverables

* Dashboard page
* Projects page
* Create project
* Edit project
* Delete project

## Definition of Done

* User can create a project
* User can view all projects
* User can update a project
* User can delete a project

---

# Phase 4 — Dynamic Form Builder

## Goal

Allow users to create custom forms.

## Deliverables

* Form Builder UI
* Form name (used to identify it in the dashboard)
* Add Text Field
* Add Textarea Field
* Add Image Upload Field
* Save form schema

## Definition of Done

* Form has a name stored in the database
* Form schema is stored in database
* User can edit forms
* User can delete forms

---

# Phase 5 — Public Form Submissions

## Goal

Collect information from external users.

## Deliverables

* Public form route
* Dynamic form rendering
* Form submission handling
* Success page

## Definition of Done

* External users can submit forms
* Responses are stored in database
* Image uploads work

---

# Phase 6 — Submission Management

## Goal

Allow creators to view and manage submissions.

## Deliverables

* Submission list
* Submission details page
* Delete submission
* Search submissions

## Definition of Done

* User can view responses
* User can inspect response data
* User can remove submissions

---

# Phase 7 — Template Management

## Goal

Allow creators to create reusable templates.

## Deliverables

* Template gallery
* Upload background image
* Create placeholders
* Save template configuration

## Definition of Done

* Templates can be created
* Templates can be updated
* Templates can be deleted
* Placeholder data is stored

---

# Phase 8 — Template Editor

## Goal

Provide visual editing for templates.

## Deliverables

* React Konva canvas
* Drag placeholders
* Resize placeholders
* Save layout

## Definition of Done

* User can visually position fields
* User can resize fields
* Layout updates persist (layout_json is written to DB)

---

# Phase 9 — Image Generation Engine

## Goal

Generate graphics automatically.

## Deliverables

* Satori integration
* Resvg integration
* Template rendering service
* PNG generation

## Definition of Done

* Template + Submission = PNG
* Images render correctly
* Images are stored successfully

---

# Phase 10 — Launch MVP

## Goal

Prepare Spotlite for public use.

## Deliverables

* Landing page
* Demo Generator
* Generated Graphics Gallery
* Settings page
* Dark mode
* Error handling
* Empty states

## Definition of Done

A new user can:

1. Visit Spotlite
2. Test the demo
3. Create an account
4. Create a project
5. Create a form
6. Collect submissions
7. Create a template
8. Generate a graphic
9. Download the generated graphic

Spotlite MVP is complete.

---

# Post-MVP Backlog

These features are intentionally postponed.

## Automation

* Scheduled generation
* Scheduled publishing
* Cron-job integration
* WhatsApp delivery

## Collaboration

* Teams
* Roles
* Shared workspaces

## Monetization

* Billing
* Subscriptions
* Usage limits

## AI Features

* AI captions
* AI templates
* AI layout suggestions

## Advanced Features

* Bulk generation
* Template marketplace
* Public template sharing
* Analytics
* Webhooks
* Public API

Rule:

If a feature is not in the MVP phases above, it should not be built until after MVP launch.
