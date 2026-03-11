# Backend Quality Guidelines

> Code standards, forbidden patterns, and testing requirements.

---

## Code Standards

- **Language**: All code and comments MUST be in English.
- **Type Hints**: Always use Python type hints for function arguments and return values.
- **Pydantic**: Use Pydantic models for all API request/response validation.
- **FastAPI**: Follow standard FastAPI patterns (routers, dependencies).

---

## Testing

This project uses **[Pytest](https://pytest.org/)** for testing.

### Test Directory Structure
Tests are located in `backend/tests/`.
- `conftest.py`: Shared fixtures (e.g., app instance, mock database).
- `test_*.py`: Test files for specific modules.

### Running Tests
From the `backend/` directory:

```bash
pytest
```

---

## Forbidden Patterns

- [X] **Direct JSON manipulation**: Don't use raw `dict` for API responses; always use Pydantic and the `ApiResponse` envelope.
- [X] **Print Statements**: Never use `print()` for logging; use `loguru`.
- [X] **Hardcoded Paths**: Use `settings` from `app/core/config.py` for all file and directory paths.
- [X] **In-module Instantiation**: Avoid instantiating registries at the module level; use the `container` for dependency injection.

---

## Guidelines for New Features

- [OK] Every new API endpoint should have a corresponding Pydantic schema.
- [OK] Every business logic change should be accompanied by a unit test.
- [OK] Documentation for new endpoints should be added via FastAPI's `summary` and `description` parameters.
