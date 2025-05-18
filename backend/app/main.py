from fastapi import FastAPI
from app.api.routers.upload import router as upload_router
from app.api.routers.rag import router as rag_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI()


# Include routers
app.include_router(upload_router, prefix="/api")
app.include_router(rag_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}