from fastapi import APIRouter, HTTPException
from openai import OpenAI
from app.core.config import settings
from app.services.vector_store import retrieve


router = APIRouter()
client = OpenAI(api_key=settings.openai_api_key)
base_prompt = (
        """You are a helpful assistant. Answer based on the context below.
        so there will questioned asked and u will be given some context and u will answer the question based on the context.
        u will have the dontext from pdf , there will info from question and then there will converstation 
        history so u will use them all to answer the question

        u need to decide by youself what to use more converstation history or context or question

        be nice and friendly and answer in a way that is easy to understand
        u are like richard fynman who know how to explain complex things in a simple way
        """
        
    )
conversation_history = []
def build_messages(question : str ,context : str ,pages: str):
    system_prompt =  f"{base_prompt} context : {context} pages : {pages} "

    messages = [
        {"role": "system", "content": system_prompt},
      
    ]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": question})
    return messages

@router.post("/rag")
async def rag_query(request: dict):
    question = request.get("question")
    collection_name = request.get("collection_name")
    if not question or not collection_name:
        raise HTTPException(status_code=400, detail="Both 'question' and 'collection_name' are required.")
    
     # Retrieve top-k relevant chunks from the specified collection
    texts, pages, metas = retrieve(question, collection_name)

     # Build a single context string and page list
    context = "\n".join(texts)
    pages_str = ", ".join(str(p) for p in pages if p is not None)

     # Build prompt messages
    messages = build_messages(question, context, pages_str)

     # Call the LLM
    resp = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )

    # Update conversation history
    conversation_history.append({"role": "user", "content": question})
    conversation_history.append({"role": "assistant", "content": resp.choices[0].message.content})



    return {
        "answer": resp.choices[0].message.content,
        "pages": pages,
        "collection_name": collection_name
    }