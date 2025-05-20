from pathlib import Path
from langchain_qdrant import QdrantVectorStore 
from app.core.config import settings
from app.services.embeddings import get_embedding_model
from app.utils.file_loader import load_and_split
from qdrant_client import QdrantClient, models
from app.core.config import settings
from uuid import uuid4
from datetime import datetime, UTC
import logging
import re
from app.utils.url_loader import load_and_split_multiple_urls
from app.utils.findUrls import find_urls

# Shared Qdrant client and embedding model (initialized once per server process)
_client = QdrantClient(
    url=settings.qdrant_url,
    api_key=getattr(settings, "qdrant_api_key", None)
)


_embedding_model = get_embedding_model()

def get_client():
    return _client


def init_store_for_url(url: str):
    """
    Initialize the Qdrant vector store with the contents of a URL.
    """
    try:
        client = get_client()
        collection_name = f"{url}-{uuid4().hex}"

        # Create a new collection
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=3072,  # OpenAI embeddings-3 models use 3072 dimensions
                distance=models.Distance.COSINE
            ),
            shard_number=1
        )

        # Load the URL content  
        docs = load_and_split_multiple_urls(find_urls(url))
        logging.info(f"Split URL into {len(docs)} chunks")

        # Use LangChain's from_documents to properly add documents with embeddings
        store = QdrantVectorStore.from_documents(
            documents=docs,
            embedding=_embedding_model,
            collection_name=collection_name,
            url=settings.qdrant_url,
            api_key=getattr(settings, "qdrant_api_key", None)
        )

        logging.info(f"Successfully added {len(docs)} documents to collection {collection_name}")   
    
        return collection_name
    except Exception as e:
        logging.error(f"Error in init_store_for_url: {str(e)}")
        raise


def init_store_for_pdf(pdf_path: Path):
    """
    Initialize the Qdrant vector store with the contents of a PDF file.
    
    Args:
        pdf_path (Path): The path to the PDF file to be processed.
    """
    try:
        client = get_client()

        # Generate a unique collection name for this PDF
        collection_name = f"{pdf_path.stem}-{uuid4().hex}"

        # Create a new collection
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(
                size=3072,  # OpenAI embeddings-3 models use 3072 dimensions
                distance=models.Distance.COSINE
            ),
            shard_number=1
        )
        
        # Split the PDF into chunks
        docs = load_and_split(pdf_path)
        logging.info(f"Split PDF into {len(docs)} chunks")
        
        now = datetime.now(UTC).isoformat()
        
        # Use LangChain's from_documents to properly add documents with embeddings
        store = QdrantVectorStore.from_documents(
            documents=docs,
            embedding=_embedding_model,
            collection_name=collection_name,
            url=settings.qdrant_url,
            api_key=getattr(settings, "qdrant_api_key", None)
        )
        
        logging.info(f"Successfully added {len(docs)} documents to collection {collection_name}")
        
        return collection_name
    except Exception as e:
        logging.error(f"Error in init_store_for_pdf: {str(e)}")
        raise


def retrieve(query: str, collection_name: str, k: int=5):
    """
    Retrieve relevant documents from a collection based on a query.
    
    Args:
        query: The search query
        collection_name: The name of the Qdrant collection to search
        k: Number of results to return (default: 5)
        
    Returns:
        Tuple of (texts, pages, metadata)
    """
    try:
        # Reuse the existing global client instead of creating a new one
        client = get_client()
        
        # Create vector store using the existing client
        store = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=_embedding_model
        )
    
        results = store.similarity_search(query, k=k)
        texts = [r.page_content for r in results]
        pages = [r.metadata.get("page") for r in results]
        metas = [r.metadata for r in results]
        return texts, pages, metas
    except Exception as e:
        logging.error(f"Error in retrieve function: {str(e)}")
        raise

def delete_collection(collection_name: str):
    """
    Delete a collection from Qdrant.
    
    Args:
        collection_name: The name of the collection to delete
        
    Returns:
        bool: True if successful
    """
    try:
        client = get_client()
        client.delete_collection(collection_name=collection_name)
        logging.info(f"Successfully deleted collection: {collection_name}")
        return True
    except Exception as e:
        logging.error(f"Failed to delete collection {collection_name}: {str(e)}")
        raise

def list_collections():
    """
    List all collections in Qdrant.
    
    Returns:
        List of collection information with display names 
    """
    try:
        client = get_client()
        collections_info = client.get_collections().collections
        
        # Extract original filename from collection names (format: filename-uuid)
        result = []
        for collection_info in collections_info:
            name = collection_info.name
            
            # Try to extract the original filename part
            match = re.match(r"(.*)-[a-f0-9]+$", name)
            display_name = match.group(1) if match else name
            
            # Get collection details including vector count
            collection_details = client.get_collection(collection_name=name)
            vectors_count = collection_details.vectors_count if hasattr(collection_details, "vectors_count") else 0
            
            result.append({
                "name": name,  # Full collection name for API calls
                "display_name": display_name,  # Original filename part for display
                "vectors_count": vectors_count
            })
            
        return result
    except Exception as e:
        logging.error(f"Failed to list collections: {str(e)}")
        raise




