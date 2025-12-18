# Coding Rules

## Coding Standards

- Use **camelCase** for variable and function naming.
- Use **async/await** for asynchronous operations.
- Always use **object notation** for parameter passing (e.g., `{ userId, email }` instead of positional arguments).
- Use `src/utils/` for shared utility functions.
- Prefer **named exports** over default exports for utilities and controllers.
- Use **ES Modules** (`import/export`) syntax.
- Keep functions small and focused on a single responsibility.
- Use **try/catch** blocks in controllers for error handling.
- Run `npm run format` (Prettier) before committing.

## Database

- Use **snake_case** for table and column naming.
- DB model functions should be reusable for multiple scenarios.
- Use Knex query builder; avoid raw SQL unless necessary.
- Always use **soft deletes** (`is_deleted`, `deleted_at`) instead of hard deletes.

## Security

- Never return sensitive data in response.
- Never log sensitive data (passwords, tokens).

## Project Structure

- **Controllers**: Handle request logic and response formatting.
- **Models**: Handle database interactions only.
- **Utils**: Contain shared helper functions (e.g., `tokenUtils.js`).
- **Middleware**: Handle cross-cutting concerns (auth, logging).
- **Routes**: Define URL-to-controller mappings only; no business logic.

## Error Handling

- Return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500).
- Return errors as JSON: `{ error: "message" }`.
- Log errors with `console.error` in controllers.
