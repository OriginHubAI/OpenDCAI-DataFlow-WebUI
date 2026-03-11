# Error Handling Guidelines

> Error types, handling strategies, and response format.

---

## Core Strategy: The "All 200" Pattern

**CRITICAL**: This project returns `HTTP 200 OK` for almost ALL requests, including errors. The actual status of the request is determined by the `success` field in the `ApiResponse` envelope.

### The Response Envelope (`ApiResponse`)

Every response from the API follows this structure:

```json
{
  "success": true | false,
  "code": 200 | 40001 | 50000, // Business error code
  "message": "Error message",
  "data": { ... },           // Payload
  "meta": { ... }            // Optional metadata like HTTP status
}
```

---

## Error Types

### 1. `ApiError` (Business Logic Errors)

Use `ApiError` or its subclasses for expected business logic failures.

- **`NotFoundError`**: When a resource doesn't exist.
- **`ConflictError`**: When an operation conflicts with existing data.
- **`ValidationBizError`**: For custom validation failures.

**Example Usage**:
```python
from app.api.v1.errors import NotFoundError

if not ds:
    raise NotFoundError("Dataset not found")
```

### 2. `HTTPException`

FastAPI's standard `HTTPException` can also be used; it is caught by a global handler and converted into an `ApiResponse`.

```python
from fastapi import HTTPException

raise HTTPException(400, "Invalid parameters")
```

### 3. Validation Errors

Pydantic validation errors are automatically caught and returned as `ApiResponse` with code `42200`.

---

## Guidelines for Developers

- [OK] **Always use `ApiError` subclasses** for domain-specific errors.
- [OK] **Prefer `ok()` and `created()` helpers** in `app/api/v1/resp.py` for successful responses.
- [X] **Don't use raw `JSONResponse`** with non-200 status codes in endpoints; let the exception handlers handle it.
- [X] **Always provide descriptive error messages** to help the frontend display meaningful alerts.

---

## Global Exception Handlers

Handlers are defined in `app/api/v1/handlers.py`. They ensure:
1. `ApiError` is converted to `ApiResponse`.
2. `HTTPException` is converted to `ApiResponse`.
3. Unhandled `Exception` is caught and returned as `50000` (Internal Error) to prevent leaking stack traces.
