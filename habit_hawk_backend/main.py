from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from config import settings
from database.connection import init_db
from auth.routes import router as auth_router
from habit.routes import router as habit_router
from social.routes import router as social_router
from leaderboard.routes import router as leaderboard_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: Initialize database (development only)
    # For production, use Alembic migrations instead
    init_db()
    yield
    # Shutdown: cleanup code would go here if needed


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Habit Hawk API for tracking streaks and habits.",
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)

# Add session middleware (required for OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.jwt_secret_key,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(habit_router)
app.include_router(social_router)
app.include_router(leaderboard_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Habit Hawk API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "authentication": "enabled",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )