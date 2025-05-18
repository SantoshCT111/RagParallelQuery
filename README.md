# RAG App

A simple Retrieval‑Augmented Generation (RAG) application that lets users upload PDFs and chat with the content via GPT-4o. Built as a monorepo with:

* **Backend**: Python • FastAPI • Qdrant • OpenAI embeddings & chat
* **Frontend**: React • Vite (or CRA) • Fetch API

---

## 📂 Project Structure

```
rag-app/
├── docker-compose.yml       # Qdrant, backend & frontend services
├── README.md
├── frontend/                # React app
└── backend/                 # FastAPI app + PDF indexing
    ├── Dockerfile
    ├── requirements.txt
    ├── .env                 # (not committed) OpenAI key
    └── app/
        ├── core/
        │   └── config.py    # environment & settings
        ├── utils/
        │   └── file_loader.py
        ├── services/
        │   ├── embeddings.py
        │   └── vector_store.py
        └── api/
            ├── routers/
            │   ├── upload.py
            │   └── rag.py
            └── main.py
```

---

## 🚀 Prerequisites

* **Docker** & **Docker Compose**
* **Python 3.10+**, **pip**
* **Node.js v16+**, **npm** or **yarn**

---

## 🔧 Backend Setup (Local)

1. **Start Qdrant**

   ```bash
   docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:v1.3.0
   ```
2. **Create & activate virtual env** in `backend/`

   ```bash
   cd rag-app/backend
   python3 -m venv venv
   source venv/bin/activate   # macOS/Linux
   pip install -r requirements.txt
   ```
3. **Configure API key**

   * Copy `.env.example` to `.env` (or create) with:

     ```env
     OPENAI_API_KEY=sk-...
     ```
4. **(Optional) Index an initial PDF**

   ```bash
   # assuming uploads/math.pdf exists
   python - <<'PYCODE'
   from pathlib import Path
   from app.services.vector_store import init_store_for_pdf
   init_store_for_pdf(Path("uploads/math.pdf"))
   PYCODE
   ```
5. **Run FastAPI**

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
6. **Test**

   ```bash
   curl http://localhost:8000/health
   # {"status":"ok"}

   curl -F "file=@path/to/file.pdf" http://localhost:8000/api/upload
   curl -X POST http://localhost:8000/api/rag -H "Content-Type: application/json" \
     -d '{"question":"What is the Pythagorean theorem?"}'
   ```

---

## 💻 Frontend Setup (Local)

1. **Install deps & start** in `frontend/`

   ```bash
   cd rag-app/frontend
   npm install
   npm run dev           # or `yarn dev`
   ```
2. **Open** [http://localhost:3000](http://localhost:3000) and upload a PDF, then chat with it.

---

## 🐳 Using Docker Compose (All‑in‑One)

1. From project root, set your key:

   ```bash
   export OPENAI_API_KEY=sk-...
   ```
2. Run:

   ```bash
   docker-compose up --build
   ```
3. Qdrant → :6333, Backend → :8000, Frontend → :3000

---

## ⚙️ Configuration

* All backend settings live in `backend/.env`
* Qdrant URL & collection name configured in `app/core/config.py`

---

Happy building! 🎉
