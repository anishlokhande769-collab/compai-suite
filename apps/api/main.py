from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from apps.api.services.llm import llm_service

from apps.api.routes.knowledge import router as knowledge_router
from apps.api.services.rag import rag_service

app = FastAPI(title="ProAI API")

# ... (CORS etc)

app.include_router(knowledge_router)

@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    data = await request.json()
    model = data.get("model", "gemini")
    messages = data.get("messages", [])
    use_rag = data.get("use_rag", False)

    # If RAG is enabled, inject context into the last message
    if use_rag and messages:
        last_query = messages[-1]["content"]
        context_chunks = await rag_service.search(last_query)
        if context_chunks:
            context_text = "\n".join([c["content"] for c in context_chunks])
            messages[-1]["content"] = f"Context from Knowledge Base:\n{context_text}\n\nUser Question: {last_query}"

    async def generate():
        async for chunk in llm_service.stream_chat(model, messages):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
