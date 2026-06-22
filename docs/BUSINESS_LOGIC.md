# BUSINESS_LOGIC.md

## Project Flow

User creates a project.

A project contains:

* Forms
* Submissions
* Templates
* Generated Images

---

## Form Creation

Users create custom fields.

Examples:

* Name
* Photo
* Quote
* Department

Fields are stored as JSON.

---

## Form Submission

Users access a public form URL.

Responses are stored as submissions.

---

## Template Creation

Users upload a background image.

Users place placeholders:

* Text
* Images

Placeholder positions are stored in layout_json.

---

## Image Generation

Input:

* Template
* Submission

Output:

* PNG Image

Generated images are stored and can be downloaded.

---

## Ownership Rules

Users can only access their own projects, forms, templates, submissions, and generated images.

---

## Future Features

* Scheduling
* WhatsApp Delivery
* Bulk Generation
* Team Workspaces
* Notifications
* Analytics
