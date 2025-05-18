from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import os
import logging
from app.services.vector_store import init_store_for_pdf

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        #save uploaded file 
        upload_dir = Path("/app/uploads")
        upload_dir.mkdir(exist_ok=True, parents=True)
        
        # Log path info
        logging.info(f"Upload directory: {upload_dir.absolute()}")
        logging.info(f"Directory exists: {upload_dir.exists()}")
        
        file_path = upload_dir / file.filename
        logging.info(f"Saving file to: {file_path}")

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logging.info(f"File saved successfully: {file_path}")
   
        # Index in Qdrant
        try:
            init_store_for_pdf(file_path)
            logging.info(f"File indexed successfully: {file_path}")
        except Exception as e:
            logging.error(f"Indexing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

        return {"status": "indexed", "file": file.filename}
    except Exception as e:
        logging.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    