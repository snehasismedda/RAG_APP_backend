# Chat API

Base URL: `http://localhost:8000`
Auth: All routes require JWT cookie

---

## POST /chat

**Use:** Send message to AI and save conversation

**Request Body:**

```json
{
  "query": "string (required)",
  "model": "gemini",
  "modelId": "gemini-2.5-flash",
  "temperature": 0.7,
  "maxOutputTokens": 1000,
  "systemInstruction": "string (optional)",
  "notebookId": "string",
  "chatId": "string (required)"
}
```

**Response (200):**

```json
{
  "response": "AI generated response text"
}
```

---

## POST /chat/create

**Use:** Create a new chat session in a notebook

**Request Body:**

```json
{
  "title": "string",
  "notebookId": "string"
}
```

**Response (201):**

```json
{
  "id": "272417636529355700",
  "title": "Chat Title",
  "fk_notebook_id": "272417636470979915",
  "fk_user_id": "272417636470979914",
  "is_deleted": false,
  "created_at": "2025-12-05T15:43:45.000Z",
  "updated_at": null
}
```

---

## GET /chat/notebook/:notebookId

**Use:** Get all chats in a notebook

**URL Params:**

- `notebookId` - Notebook ID

**Response (200):**

```json
[
  {
    "id": "272417636529355700",
    "title": "Chat Title",
    "created_at": "2025-12-05T15:43:45.000Z",
    "updated_at": null
  }
]
```

---

## GET /chat/:id

**Use:** Get chat by ID

**URL Params:**

- `id` - Chat ID

**Response (200):**

```json
{
  "id": "272417636529355700",
  "title": "Chat Title",
  "fk_notebook_id": "272417636470979915",
  "created_at": "2025-12-05T15:43:45.000Z",
  "updated_at": null
}
```

---

## PUT /chat/:id

**Use:** Update chat title

**URL Params:**

- `id` - Chat ID

**Request Body:**

```json
{
  "title": "string"
}
```

**Response (200):** Updated chat object

---

## DELETE /chat/:id

**Use:** Delete chat (soft delete)

**URL Params:**

- `id` - Chat ID

**Response (200):**

```json
{
  "message": "Chat deleted successfully"
}
```

---

## GET /chat/conversation/:chatId

**Use:** Get conversation history for a chat

**URL Params:**

- `chatId` - Chat ID

**Response (200):**

```json
[
  {
    "message": "[{\"text\": \"User message\"}]",
    "metadata": null,
    "role": "user"
  },
  {
    "message": "[{\"text\": \"AI response\"}]",
    "metadata": null,
    "role": "assistant"
  }
]
```

**Response (404):**

```json
{
  "error": "Chat not found"
}
```
