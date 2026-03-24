from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from apps.api.services.rag import rag_service
import shutil
import os

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Create temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process in background
    background_tasks.add_task(process_file, temp_path, file.filename)
    
    return {"message": "File upload started", "filename": file.filename}

async def process_file(path: str, filename: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Simple chunking for now
        chunks = [content[i:i+1000] for i in range(0, len(content), 800)]
        
        for i, chunk in enumerate(chunks):
            await rag_service.embed_and_store(
                text_content=chunk,
                metadata={"source": filename, "chunk": i}
            )
    finally:
        if os.path.exists(path):
            os.remove(path)

@router.get("/search")
async def search_knowledge(query: str):
    results = await rag_service.search(query)
    return results
