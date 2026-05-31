from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from Phase_1.intent_classifier import IntentClassifier
from Phase_1.reflective_engine import ReflectiveEngine, ChatResponse

# Initialize FastAPI App
app = FastAPI(
    title="Smart Reflection Layer API",
    description="Backend service managing prompt intent routing and structured reasoning layers.",
    version="1.0.0"
)

# Configure CORS Middleware
# Essential for allowing frontend integrations (Phase 2) to connect seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Services
classifier = IntentClassifier()
engine = ReflectiveEngine()

# ==========================================
# API Models
# ==========================================

class ChatRequest(BaseModel):
    prompt: str = Field(..., description="The user prompt to analyze and answer")

# ==========================================
# Routes
# ==========================================

@app.get("/api/health")
def health_check():
    """
    Simple heartbeat endpoint to verify server status.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "Smart Reflection Layer API"
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Primary endpoint for processing conversational queries.
    
    1. Classifies user prompt for strategic intent.
    2. Routes to low-stakes (direct output) or high-stakes (structured reflection) generation paths.
    3. Returns standard or rich structured outputs depending on strategic risk profile.
    """
    prompt = request.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt content cannot be empty.")

    try:
        # Step 1: Classify prompt strategic intent
        classification = classifier.classify(prompt)
        is_strategic = classification["is_strategic"]
        
        # Step 2: Route to correct pipeline
        if is_strategic:
            # High-Stakes Path: Inject Smart Reflection Layer
            response = engine.generate_strategic(prompt)
        else:
            # Low-Stakes Path: Standard completion, reflection layer remains hidden
            response = engine.generate_low_stakes(prompt)
            
        return response

    except Exception as e:
        # Log error in production
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while compiling reasoning layers: {str(e)}"
        )
