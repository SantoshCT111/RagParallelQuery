from fastapi import FastAPI
from api.routers.upload import router as upload_router
from api.routers.rag import router as rag_router

app = FastAPI()


# Include routers
app.include_router(upload_router, prefix="/api/")
app.include_router(rag_router, prefix="/api/")


@app.get("/health")
def health():
    return {"status": "ok"}