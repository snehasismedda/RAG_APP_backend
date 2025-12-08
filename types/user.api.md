# User API

Base URL: `http://localhost:8000`

---

## POST /user/register

**Use:** Register a new user account

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "userId": "string"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "272417636470979915",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "userId": "johndoe123"
  }
}
```

---

## POST /user/login

**Use:** Login and get auth cookies

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "272417636470979915",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userId": "johndoe123"
  }
}
```
*Sets `jwt` and `refresh_token` cookies*

---

## POST /user/logout

**Use:** Logout and clear cookies

**Response (204):** No content

---

## DELETE /user/delete

**Use:** Delete current user account

**Auth:** Required

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```
