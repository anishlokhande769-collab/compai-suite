from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    GOOGLE_API_KEY: Optional[str] = None
    NVIDIA_API_KEY: Optional[str] = None
    KIMI_API_KEY: Optional[str] = None
    
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/proai"
    REDIS_URL: str = "redis://redis:6379/0"
    
    JWT_SECRET: str = "secret"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
