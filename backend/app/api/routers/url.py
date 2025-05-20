from fastapi import APIRouter, HTTPException
from app.services.vector_store import init_store_for_url
from app.services.vector_store import delete_collection


router = APIRouter()

@router.post("/url")
async def url_query(request: dict):
    url = request.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    try:
        collection_name = init_store_for_url(url)
        return {"collection_name": collection_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



    return {"collection_name": collection_name}



@router.delete("/url/{collection_name}")
def delete_url_collection(collection_name: str):
    delete_collection(collection_name)
    return {"message": "Collection deleted successfully"}




