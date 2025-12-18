# Notebook API

Base URL: `http://localhost:8000`
Auth: All routes require JWT cookie

---

## POST /notebook

**Use:** Create a new notebook

**Request Body:**

```json
{
  "title": "string",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "id": "272417636470979915",
  "title": "My Notebook",
  "description": "Optional description",
  "fk_user_id": "272417636470979914",
  "is_deleted": false,
  "created_at": "2025-12-05T15:43:45.000Z",
  "updated_at": null
}
```

---

## GET /notebook

**Use:** Get all notebooks for current user

**Response (200):**

```json
[
  {
    "id": "272417636470979915",
    "title": "My Notebook",
    "description": "Description",
    "created_at": "2025-12-05T15:43:45.000Z",
    "updated_at": null
  }
]
```

---

## GET /notebook/:id

**Use:** Get notebook by ID

**URL Params:**

- `id` - Notebook ID

**Response (200):**

```json
{
  "id": "272417636470979915",
  "title": "My Notebook",
  "description": "Description",
  "created_at": "2025-12-05T15:43:45.000Z",
  "updated_at": null
}
```

---

## PUT /notebook/:id

**Use:** Update notebook

**URL Params:**

- `id` - Notebook ID

**Request Body:**

```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

**Response (200):** Updated notebook object

---

## DELETE /notebook/:id

**Use:** Delete notebook (soft delete)

**URL Params:**

- `id` - Notebook ID

**Response (200):**

```json
{
  "message": "Notebook deleted successfully"
}
```
