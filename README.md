# RAG Chat - Parallel Query

A modern Retrieval-Augmented Generation (RAG) application that enables users to upload PDF documents and have interactive conversations with their content via OpenAI's GPT models. This application features parallel query processing for enhanced response quality.

## 🌟 Features

- **PDF Document Uploads**: Upload and process any PDF document
- **Interactive Chat Interface**: Modern UI with chat history
- **Vector Search**: Semantic search powered by Qdrant
- **Persistent Chat History**: Conversations are saved locally
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

The application is built as a monorepo with three main components:

* **Backend**: Python • FastAPI • LangChain • OpenAI embeddings & chat completions
* **Vector DB**: Qdrant for vector storage and similarity search
* **Frontend**: React • Tailwind CSS • Modern chat UI with chat history

## 📂 Project Structure

```
RagParallelQuery/
├── docker-compose.yml       # Containers for all three services
├── README.md
├── frontend/                # React app with modern UI
│   ├── Dockerfile
│   ├── package.json         # Node.js dependencies
│   ├── postcss.config.js    # PostCSS for Tailwind
│   ├── tailwind.config.js   # Tailwind configuration
│   └── src/
│       ├── components/      # React components 
│       │   ├── ChatWindow.jsx
│       │   └── DocumentUploader.jsx
│       ├── api/
│       │   └── ragService.js # API service for backend communication
│       ├── App.jsx          # Main application component
│       └── index.js         # Application entry point
└── backend/                 # FastAPI application
    ├── Dockerfile
    ├── requirements.txt     # Python dependencies
    ├── .env                 # OpenAI API key
    ├── uploads/             # Directory for uploaded PDFs
    └── app/
        ├── core/
        │   └── config.py    # Environment settings
        ├── utils/
        │   └── file_loader.py # PDF loading utilities
        ├── services/
        │   ├── embeddings.py  # OpenAI embeddings service
        │   └── vector_store.py # Qdrant integration
        └── api/
            ├── routers/
            │   ├── upload.py  # PDF upload endpoint
            │   └── rag.py     # Chat query endpoint
            └── main.py        # FastAPI application entry point
```

## 🚀 Prerequisites

* **Docker** & **Docker Compose** (recommended for easy setup)
* **Python 3.11+** & **pip** (for local backend development)
* **Node.js v18+** & **npm** (for local frontend development)
* **OpenAI API key** with access to GPT-4o and embeddings

## 🔧 Getting Started with Docker (Recommended)

The easiest way to run the application is using Docker Compose.

1. **Create .env file** in the `backend` directory with your OpenAI API key:

   ```env
   OPENAI_API_KEY=sk-...
   ```

2. **Start all services** from the project root:

   ```bash
   docker-compose up --build
   ```

3. **Access the application** at http://localhost:3001

4. **Access Qdrant dashboard** at http://localhost:6343/dashboard

## 📱 Using the Application

1. **Upload a PDF document** using the interface
2. **Start asking questions** about your document
3. **Previous conversations** are saved automatically
4. **Switch between documents** using the sidebar

## 🛠️ Local Development Setup

### Backend Setup

1. **Start Qdrant** (or use your existing instance):

   ```bash
   docker run -d --name qdrant -p 6333:6333 qdrant/qdrant:latest
   ```

2. **Set up Python environment**:

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # macOS/Linux
   # or venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

3. **Configure API key** in `.env`:

   ```env
   OPENAI_API_KEY=sk-...
   ```

4. **Create uploads directory**:

   ```bash
   mkdir -p uploads
   ```

5. **Run the FastAPI backend**:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install dependencies**:

   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm start
   ```

3. **Access** the frontend at http://localhost:3000

## 🔌 API Endpoints

- `GET /health` - Check API health
- `POST /api/upload` - Upload and process a PDF file
- `POST /api/rag` - Submit a question about a document

## ⚙️ Configuration

- **Backend settings**: Found in `backend/.env` and `backend/app/core/config.py`
- **Qdrant settings**: Collection name set to "parallel_query"
- **Frontend proxy**: Configured to forward API requests to the backend

## 🚀 Future Improvements

- Add authentication and user accounts
- Support for multiple file formats (beyond PDF)
- Advanced RAG techniques like hypothetical document embeddings
- Custom model selection
- Cloud deployment guide

## 📄 License

This project is open source under the MIT License.

---

Enjoy your powerful RAG Chat application! 🎉
