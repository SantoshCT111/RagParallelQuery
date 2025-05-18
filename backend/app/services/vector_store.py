from pathLib import Path
from langchain_qdrant import QdrantVectorStore 
from app.core.config import settings
from app.services.embeddings import get_embedding_model
from app.utils.file_loader import load_and_split


def init_store_for_pdf(pdf_path: Path):
    """
    Initialize the Qdrant vector store with the contents of a PDF file.
    
    Args:
        pdf_path (Path): The path to the PDF file to be processed.
    """
    

    docs = load_and_split(pdf_path)

    for d in docs:
        d.metadata["source"] = str(pdf_path)
    return QdrantVectorStore.from_documents(
        documents=docs,
        embedding=get_embedding_model(),
        url=settings.qdrant_url,
        collection_name=settings.qdrant_collection
    )


def retrieve(Query : str , k :int=5):
    store = QdrantVectorStore.from_existing_collection(
        embedding=get_embedding_model(),
        url=settings.qdrant_url,
        collection_name=settings.qdrant_collection
    )
     results = store.similarity_search(query, k=k)
    texts = [r.page_content for r in results]
    pages = [r.metadata.get("page") for r in results]
    return texts, pages


