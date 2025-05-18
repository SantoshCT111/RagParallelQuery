from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "parallel_query"
    qdrant_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()