# app/api/delete.py
from fastapi import APIRouter, HTTPException, status
from app.services.vector_store import get_client

router = APIRouter()

@router.delete("/collections/{collection_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(collection_name: str):
    client = get_client()

    # 1. Optional: check existence first
    if not client.has_collection(collection_name=collection_name):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Collection '{collection_name}' does not exist."
        )
    
    # 2. Delete it
    try:
        client.delete_collection(collection_name=collection_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete collection: {e}"
        )

    # 3. No content to return on success
    return
