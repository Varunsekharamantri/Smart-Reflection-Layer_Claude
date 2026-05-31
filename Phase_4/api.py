from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import asyncio
from typing import Any

from Phase_4.intent_classifier import IntentClassifier
from Phase_4.reflective_engine import ReflectiveEngine, ChatResponse

app = FastAPI(
    title="Smart Reflection Layer Streaming API",
    description="Backend service managing prompt intent routing and structured reasoning layers with SSE.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = IntentClassifier()
engine = ReflectiveEngine()

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="The user prompt to analyze and answer")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Smart Reflection Layer API"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Standard synchronous JSON route (Phase 1/2/3 compat).
    """
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt content cannot be empty.")

    try:
        classification = classifier.classify(prompt)
        is_strategic = classification["is_strategic"]
        
        if is_strategic:
            response = engine.generate_strategic(prompt)
        else:
            response = engine.generate_low_stakes(prompt)
            
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/stream")
async def chat_stream_endpoint(prompt: str):
    """
    Asynchronous Server-Sent Events (SSE) streaming route (Phase 4).
    Streams core text tokens first, then yields structured reflection envelopes.
    """
    prompt_clean = prompt.strip()
    if not prompt_clean:
        raise HTTPException(status_code=400, detail="Prompt content cannot be empty.")

    try:
        # Pre-compute strategic routing classification
        classification = classifier.classify(prompt_clean)
        is_strategic = classification["is_strategic"]
        
        if not is_strategic:
            # Low stakes bypassed: stream standard response directly
            async def low_stakes_generator():
                resp = engine.generate_low_stakes(prompt_clean)
                yield f"event: text\ndata: {json_dumps({'text': resp.response_text})}\n\n"
                await asyncio.sleep(0.05)
                yield f"event: reflection\ndata: {json_dumps({'status': 'inactive', 'highlights': [], 'modules': None})}\n\n"
                yield "event: done\ndata: {}\n\n"
            return StreamingResponse(low_stakes_generator(), media_type="text/event-stream")
        
        # High stakes: stream chunked reflection generator
        return StreamingResponse(
            engine.stream_strategic_chunks(prompt_clean), 
            media_type="text/event-stream"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def json_dumps(obj: Any) -> str:
    import json
    return json.dumps(obj)
