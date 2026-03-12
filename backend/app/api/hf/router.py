from fastapi import APIRouter

from app.api.hf import hub, viewer

api_router = APIRouter()

api_router.include_router(hub.router)
api_router.include_router(viewer.router, prefix="/viewer")
