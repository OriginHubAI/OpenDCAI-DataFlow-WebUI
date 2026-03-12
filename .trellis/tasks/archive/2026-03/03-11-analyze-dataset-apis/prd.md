# Analyze Dataset APIs

## Goal
Perform a comprehensive analysis of dataset-related APIs (Backend endpoints and Frontend service/hooks) and document them in a new spec file.

## Requirements
- Identify all backend endpoints related to datasets (e.g., `/dataset`, `/datasets`, etc.).
- Analyze the Pydantic schemas (Backend) and TypeScript/JSDoc types (Frontend) for dataset payloads.
- Identify how the frontend consumes these APIs (axios calls, stores, hooks).
- Document the findings in a new spec file: `.trellis/spec/backend/dataset-api-guidelines.md` or similar.

## Acceptance Criteria
- [ ] New spec file created with full API documentation.
- [ ] Cross-layer mapping between frontend hooks and backend endpoints is documented.
- [ ] Error handling and validation rules for dataset operations are identified.
