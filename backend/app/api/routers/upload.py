from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from app.services.vector_store import init_store_for_pdf

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    #save uploaded file 
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / file.filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
   

    # Index in Qdrant
    try:
        init_store_for_pdf(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")

    return {"status": "indexed", "file": file.filename}

    