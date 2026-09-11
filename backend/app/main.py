from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import (
    auth,
    products,
    catalog,
    orders,
    profile,
    voice
)


app = FastAPI(
    title="KaruKriti API",
    version="1.0.0"
)


# ==========================
# CORS
# ==========================

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================
# UPLOADS
# ==========================

BASE_DIR = Path(
    __file__
).resolve().parents[1]

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    exist_ok=True
)


app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# ==========================
# ROUTERS
# ==========================

app.include_router(
    auth.router
)

app.include_router(
    products.router
)

app.include_router(
    catalog.router
)

app.include_router(
    orders.router
)

app.include_router(
    profile.router
)

app.include_router(
    voice.router
)

# ==========================
# BASIC ROUTES
# ==========================

@app.get("/")
def root():

    return {
        "message": "KaruKriti backend is running"
    }


@app.get("/health")
def health():
    from .database import db

    return {
        "status": "ok",
        "database": db.name
    }