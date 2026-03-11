# Backend Directory Structure

> Module organization and file layout for the FastAPI backend.

---

## Core Directory: `backend/app/`

All backend logic resides in the `app/` directory.

| Directory | Purpose | Key Files / Patterns |
|-----------|---------|---------------------|
| `api/v1/` | API routing and endpoints | `router.py`, `endpoints/`, `resp.py` |
| `core/` | Core configuration and initialization | `config.py`, `container.py`, `logger_setup.py` |
| `schemas/` | Pydantic models for request/response | `dataset.py`, `task.py` |
| `services/` | Business logic and data registries | `dataset_registry.py`, `dataflow_engine.py` |

---

## Detailed breakdown

### 1. API Layer (`api/v1/`)
Follows a versioned structure. 
- **`router.py`**: The main entry point for version 1 routes. It includes all routers from `endpoints/`.
- **`endpoints/`**: Individual route handlers. Each file should focus on a specific domain (e.g., `datasets.py`).
- **`resp.py`**: Standardized response helpers (`ok`, `created`, `error`).
- **`envelope.py`**: The `ApiResponse` generic wrapper.

### 2. Schemas Layer (`schemas/`)
Contains Pydantic models.
- **Naming Convention**: Use `In` suffix for request payloads and `Out` for response payloads (e.g., `DatasetIn`, `DatasetOut`).
- Models should define field types and descriptions for OpenAPI documentation.

### 3. Services Layer (`services/`)
Handles business logic and data persistence.
- **Registries**: Classes that manage a collection of entities (e.g., `DatasetRegistry`). They typically handle CRUD operations and persist data to YAML files.
- **Engines/Executors**: Complex logic like running pipelines (e.g., `DataFlowEngine`).

### 4. Core Layer (`core/`)
Application-wide setup.
- **`config.py`**: Pydantic-based settings using environment variables.
- **`container.py`**: Manual dependency injection container that holds singletons for all registries.
- **`logger_setup.py`**: Configures `loguru` for structured logging.

---

## Example: Adding a New Feature

To add a new "Project" feature:
1. Create `schemas/project.py` with `ProjectIn` and `ProjectOut`.
2. Create `services/project_registry.py` to handle project data.
3. Register the new registry in `core/container.py`.
4. Create `api/v1/endpoints/projects.py` for the API routes.
5. Include the projects router in `api/v1/router.py`.
