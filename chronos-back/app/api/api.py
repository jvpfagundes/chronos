from fastapi import APIRouter
from app.api.endpoints import auth, entries

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(entries.router, prefix="/entries", tags=["entries"])