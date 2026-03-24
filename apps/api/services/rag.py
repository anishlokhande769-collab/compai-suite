import uuid
import google.generativeai as genai
from apps.api.core.config import settings
from apps.api.core.database import SessionLocal, DocumentChunk
from sqlalchemy import text

class RAGService:
    def __init__(self):
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)

    async def embed_and_store(self, text_content: str, metadata: dict):
        result = genai.embed_content(
            model="models/embedding-001",
            content=text_content,
            task_type="retrieval_document"
        )
        embedding = result['embedding']
        
        db = SessionLocal()
        chunk = DocumentChunk(
            id=str(uuid.uuid4()),
            content=text_content,
            metadata=metadata
        )
        db.add(chunk)
        db.commit()
        
        # Update embedding column using raw SQL (pgvector doesn't play nice with standard SQLAlchemy models sometimes)
        db.execute(
            text("UPDATE document_chunks SET embedding = :embedding WHERE id = :id"),
            {"embedding": embedding, "id": chunk.id}
        )
        db.commit()
        db.close()

    async def search(self, query: str, limit: int = 5):
        result = genai.embed_content(
            model="models/embedding-001",
            content=query,
            task_type="retrieval_query"
        )
        query_embedding = result['embedding']
        
        db = SessionLocal()
        # Cosine similarity search using pgvector <=> operator
        results = db.execute(
            text("SELECT content, metadata FROM document_chunks ORDER BY embedding <=> :embedding LIMIT :limit"),
            {"embedding": str(query_embedding), "limit": limit}
        ).fetchall()
        db.close()
        
        return [{"content": r[0], "metadata": r[1]} for r in results]

rag_service = RAGService()
