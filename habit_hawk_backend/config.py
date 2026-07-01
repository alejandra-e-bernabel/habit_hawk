"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Habit Hawk API"
    debug: bool = False

    # Database
    database_url: str = "sqlite:///./habit_hawk.db"

    # JWT Authentication
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 10080

    # CORS - Allow all localhost origins for development
    cors_origins: list[str] = ["*"]  # Allow all origins in dev
    # For production, restrict to specific origins:
    # cors_origins: list[str] = [
    #     "http://localhost:3000",
    #     "http://localhost:5173",
    #     "http://localhost:8081",  # Expo default
    #     "exp://localhost:8081",   # Expo scheme
    #     "https://yourdomain.com",
    # ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Global settings instance
settings = Settings()
