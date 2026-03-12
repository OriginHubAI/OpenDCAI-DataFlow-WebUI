# Add HF_API_PORT environment variable

## Goal
Add an environment variable `HF_API_PORT` (and its frontend equivalent `VITE_HF_API_PORT`) to allow configuring the port used for Hugging Face-related API calls independently from the main backend port.

## Requirements
### Backend
-   Add `HF_API_PORT: int = 8000` to `backend/app/core/config.py`.
-   Update `.env.example` in the root and/or backend to include `HF_API_PORT`.

### Frontend
-   Add `VITE_HF_API_PORT` to `.env.example` and `.env.production`.
-   Update `frontend/vite.config.js` to potentially use this port if provided in development (though it currently points to a hardcoded IP).
-   Update `frontend/src/axios/api.js` or `axios/config.js` to ensure HF-related calls can use this port if it differs from the main backend port.

## Acceptance Criteria
-   [ ] `HF_API_PORT` is configurable in backend `Settings`.
-   [ ] `VITE_HF_API_PORT` is available in frontend.
-   [ ] Hugging Face API calls in the frontend can be routed to the specified port.
-   [ ] Documentation (.env.example) is updated.

## Technical Notes
-   If `HF_API_PORT` is not set, it should default to the same as `PORT` (8000).
-   If the frontend is calling HF API through a proxy, `vite.config.js` needs to be updated.
-   If the frontend is calling HF API directly in production, `axios` configuration needs to handle it.
