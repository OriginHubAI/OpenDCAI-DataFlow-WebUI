# Document Environment Variables

## Goal
Document the environment variables used in the project in the README file and create a `.env.example` file to serve as a template for new developers.

## Requirements
- Update the main `README.md` to include a section about the environment variables required for both the frontend and backend.
- Create a `.env.example` file in the project root containing the relevant environment variables and placeholder/default values.

## Acceptance Criteria
- [ ] `README.md` contains clear documentation of environment variables.
- [ ] `.env.example` is created at the root directory and contains keys for frontend and backend variables.

## Technical Notes
- **Frontend variables:** `VITE_BACKEND_URL`
- **Backend variables:** `ENV`, `CORS_ORIGINS`, path configurations (`DATA_REGISTRY`, `TASK_REGISTRY`, `PIPELINE_REGISTRY`, `SERVING_REGISTRY`, `TEXT2SQL_DATABASE_REGISTRY`, `TEXT2SQL_DATABASE_MANAGER_REGISTRY`, `DATAFLOW_CORE_DIR`, `OPS_JSON_PATH`, `PREFERENCES_PATH`, `SQLITE_DB_DIR`, `CACHE_DIR`), and `DEFAULT_SERVING_FILLING`.
- Explain how variables like API keys are dynamically injected at runtime.