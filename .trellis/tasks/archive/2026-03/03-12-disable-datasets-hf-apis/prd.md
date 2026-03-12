# Disable Datasets and HF APIs

## Goal
Add environment variables to the backend to allow disabling the datasets and Hugging Face (HF) APIs.

## Requirements
- Introduce `ENABLE_DATASETS_API` (default: `true`) and `ENABLE_HF_API` (default: `true`) environment variables in the backend configuration.
- Update the backend API registration logic to conditionally include datasets and HF API routers based on these variables.
- Update `.env.example` to include these new environment variables.
- Update the API documentation in `README.md` if necessary.

## Acceptance Criteria
- [ ] Backend starts successfully with default configurations (APIs enabled).
- [ ] Setting `ENABLE_DATASETS_API=false` disables the `/api/v1/datasets` endpoints.
- [ ] Setting `ENABLE_HF_API=false` disables the `/api/hf` endpoints.
- [ ] `.env.example` contains the new variables with default values.

## Technical Notes
- Implementation should be in `backend/app/main.py` where routers are registered.
- Configuration should be managed in `backend/app/core/config.py`.
