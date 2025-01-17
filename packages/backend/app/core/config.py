from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhysioAI"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "physioai"
    API_V1_STR: str = "/api/v1"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()