# app/services/embeddings.py
from langchain_openai import OpenAIEmbeddings
from app.core.config import settings

def get_embedding_model():
    return OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=settings.openai_api_key)
      