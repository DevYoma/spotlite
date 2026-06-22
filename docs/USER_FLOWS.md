# USER_FLOWS.md

# User Types

## Visitor

A user who has not created an account.

Goals:

* Learn about Spotlite
* Test the platform
* Sign up

---

## Creator

An authenticated user.

Examples:

* Class Representative
* Designer
* Community Manager
* HR Manager
* Event Organizer

Goals:

* Create projects
* Build forms
* Collect submissions
* Create templates
* Generate graphics

---

# Visitor Flow

Landing Page

↓

Demo Generator

↓

Sign Up

↓

Dashboard

---

# Creator Flow

Login

↓

Dashboard

↓

Create Project

↓

Create Form

↓

Share Form

↓

Collect Submissions

↓

Create Template

↓

Generate Graphics

↓

Download Graphics

---

# Pages

## Public Pages

### Landing Page

Route:

/

Purpose:

Explain product value.

---

### Demo Generator

Route:

/demo

Purpose:

Allow visitors to test graphic generation.

---

### Sign Up

Route:

/sign-up

---

### Login

Route:

/sign-in

---

### Public Form

Route:

/forms/[id]

Purpose:

Accept submissions.

---

# Authenticated Pages

### Dashboard

Route:

/dashboard

Purpose:

Project overview.

---

### Projects

Route:

/dashboard/projects

Purpose:

Manage projects.

---

### Project Details

Route:

/dashboard/projects/[id]

Purpose:

View a single project.

Contains:

* Forms
* Templates
* Submissions
* Graphics

---

### Form Builder

Route:

/dashboard/projects/[id]/forms

Purpose:

Create forms.

---

### Form Responses

Route:

/dashboard/projects/[id]/responses

Purpose:

View submissions.

---

### Templates

Route:

/dashboard/projects/[id]/templates

Purpose:

Manage templates.

---

### Template Editor

Route:

/dashboard/projects/[id]/templates/[templateId]

Purpose:

Edit placeholders.

Desktop-first.

---

### Graphic Generator

Route:

/dashboard/projects/[id]/generate

Purpose:

Generate graphics.

---

### Generated Graphics

Route:

/dashboard/projects/[id]/graphics

Purpose:

View generated images.

---

### Settings

Route:

/settings

Purpose:

Manage account settings.

---

# MVP Golden Path

1. User visits landing page
2. User tests demo
3. User signs up
4. User creates project
5. User creates form
6. User shares form
7. Users submit responses
8. Creator creates template
9. Creator generates graphic
10. Creator downloads graphic

If this flow works, MVP is successful.
