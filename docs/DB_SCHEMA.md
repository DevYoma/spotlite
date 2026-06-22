# DB_SCHEMA.md

## users

Stores authenticated users.

Columns:

* id
* clerk_user_id
* email
* created_at

---

## projects

A workspace for a campaign.

Examples:

* Student of the Day
* Employee of the Month

Columns:

* id
* owner_id
* name
* description
* created_at

---

## forms

Stores form configuration.

Columns:

* id
* project_id
* name
* title
* schema_json
* created_at

---

## submissions

Stores submitted responses.

Columns:

* id
* form_id
* data_json
* created_at

---

## templates

Stores graphic templates.

Columns:

* id
* project_id
* name
* background_image_url
* layout_json
* created_at

---

## generated_images

Stores generated outputs.

Columns:

* id
* submission_id
* template_id
* image_url
* created_at

## Notes

* Dynamic fields live in schema_json.
* Submission responses live in data_json.
* Template placeholder configuration lives in layout_json.
