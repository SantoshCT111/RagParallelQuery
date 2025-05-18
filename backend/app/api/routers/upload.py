from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import logging

from app.services.vector_store import init_store_for_pdf

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file, save it locally, and ingest it into Qdrant as its own collection.

    Returns the generated collection name for later retrieval.
    """
    # Prepare upload directory
    upload_dir = Path("/app/uploads")
    upload_dir.mkdir(exist_ok=True, parents=True)
    
    file_path = upload_dir / file.filename
    logging.info(f"Saving uploaded PDF to {file_path}")
    try:
        # Save file to disk
        with file_path.open("wb") as f:
            content = await file.read()
            f.write(content)
        logging.info(f"File saved: {file_path}")
    except Exception as e:
        logging.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")

    try:
        # Ingest into Qdrant and capture collection name
        collection_name = init_store_for_pdf(file_path)
        logging.info(f"PDF ingested into collection: {collection_name}")
    except Exception as e:
        logging.error(f"Indexing failed: {e}")
        raise HTTPException(status_code=500, detail="Indexing into Qdrant failed.")

    return {"status": "indexed", "collection_name": collection_name, "file": file.filename}

    