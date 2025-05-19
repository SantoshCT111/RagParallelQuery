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
from app.utils.query_decomposer import decompose_query
from openai import OpenAI

# Shared Qdrant client and embedding model (initialized once per server process)
_client = QdrantClient(
    url=settings.qdrant_url,
    api_key=getattr(settings, "qdrant_api_key", None)
)

gpt = OpenAI(api_key=settings.openai_api_key)

_embedding_model = get_embedding_model()

def get_client():
    return _client

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

base_prompt = (
        """You are a helpful assistant. Answer based on the context below.
        so u would be given a subquery and try to find short and concise answer from the context
        u need to be very specific and to the point
        u need to be very friendly and engaging
        u need to be very helpful and informative
        u need to be very accurate and precise
        u need to be very consistent and reliable
        u need to be very professional and courteous
        dont give long answers casue we are gonna use this for context again
   
        
        """
        
    )
answers = []

# Maximum number of messages to keep in conversation history
MAX_HISTORY_MESSAGES = 10
conversation_history = []

def build_messages(question: str, context: str, pages: str):
    system_prompt = f"{base_prompt} context : {context} pages : {pages} "

    messages = [
        {"role": "system", "content": system_prompt},
    ]
    
    # Add only the most recent conversation history
    if conversation_history:
        messages.extend(conversation_history[-MAX_HISTORY_MESSAGES:])
        
    messages.append({"role": "user", "content": question})
    return messages


def retrieve(query: str, collection_name: str, k: int=5):
    """
    Retrieve relevant documents from a collection based on a query.
    
    Args:
        query: The search query
        collection_name: The name of the Qdrant collection to search
        k: Number of results to return (default: 5)
        
    Returns:
        List of answer strings
    """
    try:
        # Reset answers for new query
        global answers
        answers = []
        
        # Avoid processing very short queries
        if not query or len(query.strip()) <= 2:
            return ["Please provide a more detailed question to get a helpful response."]
            
        # Reuse the existing global client instead of creating a new one
        client = get_client()
        
        # Create vector store using the existing client
        store = QdrantVectorStore(
            client=client,
            collection_name=collection_name,
            embedding=_embedding_model
        )

        # Get decomposed sub-queries
        sub_queries = decompose_query(query)
        context = ""

        for sub_query in sub_queries:
            # Skip very short sub-queries
            if len(sub_query.strip()) <= 2:
                continue
                
            print("sub_query : ", sub_query)
            
            # Get similar documents from vector store
            results = store.similarity_search(sub_query + " " + context, k=k)
            print("results : ", results)
            
            # If no results found, continue to next sub-query
            if not results:
                continue
                
            texts = [r.page_content for r in results]
            pages = [r.metadata.get("page") for r in results]
            
            # Build context string and page list
            context = "\n".join(texts)
            pages_str = ", ".join(str(p) for p in pages if p is not None)
            
            # Build messages and get response
            messages = build_messages(sub_query, context, pages_str)
            
            try:
                response = gpt.chat.completions.create(
                    model="gpt-4o",
                    messages=messages
                )
                
                response_content = response.choices[0].message.content
                print("assistant response : ", response_content)
                
                # Update conversation history (limited to most recent exchanges)
                global conversation_history
                conversation_history.append({"role": "user", "content": sub_query})
                conversation_history.append({"role": "assistant", "content": response_content})
                
                # Keep only the most recent messages
                if len(conversation_history) > MAX_HISTORY_MESSAGES * 2:
                    conversation_history = conversation_history[-MAX_HISTORY_MESSAGES * 2:]
                    
                answers.append(response_content)
            except Exception as e:
                logging.error(f"Error in GPT call: {str(e)}")
                
        # If no answers were generated, provide a fallback
        if not answers:
            return ["I couldn't find specific information to answer your question. Please try rephrasing or asking about a different topic."]
            
        return answers
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




