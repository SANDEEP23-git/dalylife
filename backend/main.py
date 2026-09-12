from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os

from auth import router as auth_router
from tasks import router as tasks_router
from db import _mongo_available, _mongo_client

load_dotenv()

app = FastAPI(
    title="Evolve API",
    description="Personal Growth System API",
    version="1.0.0"
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"}
    )

# =========================
# ROUTERS
# =========================

app.include_router(auth_router,prefix="/api")
app.include_router(tasks_router,prefix="/api")


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {
        "message": "Evolve API is running 🚀"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/api/health")
def health_check():
    if _mongo_available and _mongo_client:
        try:
            _mongo_client.admin.command("ping")
            return {
                "status": "healthy",
                "database": "connected (MongoDB Atlas)",
                "mode": "cloud"
            }
        except Exception as e:
            return {
                "status": "healthy",
                "database": "active (local fallback)",
                "mode": "local_fallback",
                "note": f"MongoDB Atlas offline ({e})"
            }
    return {
        "status": "healthy",
        "database": "active (local fallback)",
        "mode": "local_fallback",
        "note": "MongoDB Atlas connection failed/skipped. Operating in local mode."
    }