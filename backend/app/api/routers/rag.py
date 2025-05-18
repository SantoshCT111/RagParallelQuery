from fastapi impott APIRouter
from openai import OpenAI
from app.core.config import settings
from app.services.vector_store import retrieve


router = APIRouter()
client = OpenAI(api_key=settings.openai_api_key)

@router.post("/rag")
async def rag_query(question : str):
    texts, pages = retrieve(question)
    context = "\n".join(texts)
    system_prompt = (
        "You are a helpful assistant. Answer based on the context below.\n\n"
        f"CONTEXT:\n{context}\n\nPAGES: {pages}"
    )
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": question}
    ]
    resp = client.chat.completions.create(model="gpt-4o", messages=messages)
    return {"answer": resp.choices[0].message.content, "pages": pages}
