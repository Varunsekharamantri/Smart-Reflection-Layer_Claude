import os
import json
import asyncio
from typing import List, Optional, Dict, Any, AsyncGenerator
from pydantic import BaseModel, Field

# ==========================================
# Pydantic Schemas for Structured Output
# ==========================================

class Highlight(BaseModel):
    id: str = Field(..., description="Unique highlight ID")
    text_span: str = Field(..., description=" VERBATIM text substring in the response to be highlighted")
    category: str = Field(..., description="Category of reflection")

class AssumptionItem(BaseModel):
    summary: str = Field(..., description="Summary of the assumption")
    details: str = Field(..., description="Elaboration of the assumption")
    citations: List[str] = Field(default_factory=list, description="Citations of academic, business, or industry sources backing this assumption")

class ContextItem(BaseModel):
    summary: str = Field(..., description="Summary of missing context")
    details: str = Field(..., description="Elaboration of missing context")

class UncertaintyItem(BaseModel):
    summary: str = Field(..., description="Summary of the uncertainty boundary")
    details: str = Field(..., description="Elaboration of confidence boundaries")

class AlternativeItem(BaseModel):
    summary: str = Field(..., description="Summary of alternative perspective")
    details: str = Field(..., description="Explanation of alternative interpretation")

class ReflectionPrompt(BaseModel):
    question: str = Field(..., description="Critical evaluation question")

class ReflectionModules(BaseModel):
    assumptions: List[AssumptionItem] = Field(..., description="Assumptions detected")
    missing_context: List[ContextItem] = Field(..., description="Missing context gaps")
    uncertainty_boundary: List[UncertaintyItem] = Field(..., description="Confidence considerations")
    alternative_perspectives: List[AlternativeItem] = Field(..., description="Alternative interpretations")
    reflection_prompt: ReflectionPrompt = Field(..., description="Deeper human evaluation prompt")

class ReflectionMode(BaseModel):
    status: str = Field("active", description="Reflection mode status")
    highlights: List[Highlight] = Field(default_factory=list, description="Text spans linked to reasoning modules")
    modules: Optional[ReflectionModules] = Field(None, description="The 5 modules of the Reflection workspace")

class ChatResponse(BaseModel):
    response_text: str = Field(..., description="The core generated AI response text")
    reflection_mode: ReflectionMode = Field(..., description="The reflection mode validation layer data")

# ==========================================
# Reflective Inference Engine with Streaming
# ==========================================

class ReflectiveEngine:
    """
    Handles prompt layouts and structures reflections.
    Includes Task 4.1 async Server-Sent Event (SSE) generators.
    """

    def __init__(self):
        # Load environment configuration
        self.load_env()
        
        # Predefined premium mock strategic response payload matching screenshot
        self.plg_mock_response = ChatResponse(
            response_text=(
                "Yes—prioritizing PLG growth is the right strategic bet for your B2B SaaS product at this stage. "
                "It aligns with your product's strengths, accelerates learning loops, and creates a scalable engine for long-term value.\n\n"
                "Your product has strong self-serve adoption potential, and your ICPs are already showing intent-driven behavior. "
                "PLG will help you expand top-of-funnel volume, shorten time to value, and convert users through product "
                "experience instead of sales intervention.\n\n"
                "Once product-led momentum is established, you can layer in sales for expansion and enterprise motions. "
                "But establishing a PLG core now gives you optionality, compounding data advantages, and a defensible moat.\n\n"
                "### References & Claims Citations:\n"
                "1. **Product-Led Conversions**: *OpenView Product-Led Growth Benchmark Report* (Source for time-to-value claims).\n"
                "2. **Self-Serve Funnel Efficiencies**: *Gartner SaaS B2B Acquisition Index 2025* (Backing for self-serve conversion loops).\n"
                "3. **Hybrid Sales Layering**: *Harvard Business Review - The Enterprise Sales Paradox* (Validation of enterprise outbound CAC dynamics)."
            ),
            reflection_mode=ReflectionMode(
                status="active",
                highlights=[
                    Highlight(id="hl-1", text_span="shorten time to value", category="assumption"),
                    Highlight(id="hl-2", text_span="defensible moat", category="alternative")
                ],
                modules=ReflectionModules(
                    assumptions=[
                        AssumptionItem(
                            summary="Assumes churn is feature-driven",
                            details="Presumes user attrition is triggered by product utility issues rather than pricing tiers or commercial terms.",
                            citations=["Gartner SaaS B2B Index 2025", "OpenView PLG Benchmark Audit"]
                        ),
                        AssumptionItem(
                            summary="Assumes onboarding can scale efficiently",
                            details="Assumes self-serve tutorials and guided setups can successfully guide new signups without direct customer success team support.",
                            citations=["HBR - Scaling Guided Onboarding Interfaces 2024"]
                        )
                    ],
                    missing_context=[
                        ContextItem(
                            summary="No competitor pricing data",
                            details="Omission of competitor price points makes assessing the product's value proposition against alternative SaaS models speculative."
                        ),
                        ContextItem(
                            summary="Limited retention cohort evidence",
                            details="Lack of long-term weekly/monthly retention rate data for current active customers limits predictions of downstream LTV."
                        )
                    ],
                    uncertainty_boundary=[
                        UncertaintyItem(
                            summary="Confidence decreases in enterprise-heavy markets",
                            details="The proposed PLG playbook loses significant confidence if target buyers are primarily enterprise companies requiring complex security audits, procurement reviews, and high-touch sales negotiations."
                        )
                    ],
                    alternative_perspectives=[
                        AlternativeItem(
                            summary="Sales-led growth may outperform PLG for high-ACV customers",
                            details="In enterprise segments with high Annual Contract Value (ACV), a dedicated, outbound enterprise sales motion frequently triggers faster revenue velocity and higher account retention."
                        )
                    ],
                    reflection_prompt=ReflectionPrompt(
                        question="What evidence would invalidate this recommendation?"
                    )
                )
            )
        )

    def load_env(self):
        """
        Dynamically loads the workspace root .env configuration.
        """
        current_dir = os.path.dirname(os.path.abspath(__file__))
        workspace_dir = os.path.dirname(current_dir)
        paths = [
            os.path.join(workspace_dir, ".env"),
            os.path.join(current_dir, ".env"),
            ".env"
        ]
        for p in paths:
            if os.path.exists(p):
                with open(p, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ[k.strip()] = v.strip()
                break

    def safe_eval_math(self, prompt: str) -> Optional[str]:
        """
        Safely evaluates simple mathematical and arithmetic expressions.
        Supports both conversational queries ("add 2 and 2") and standard equations ("=2+2").
        Uses extreme character validation to prevent code injection.
        """
        import re
        import math
        clean = prompt.lower().strip()
        
        # Remove commas between digits (e.g., 2,000 -> 2000)
        clean = re.sub(r'(?<=\d),(?=\d)', '', clean)
        
        # 1. Conversational Arithmetic Word Parser
        # Handles phrasing like "add 5 and 6", "subtract 4 from 9", "product of 3 and 7", "divide 100 by 5"
        
        # ADDITION
        if any(k in clean for k in ["add", "sum", "plus", "addition"]):
            nums = [float(x) for x in re.findall(r"\d+\.\d+|\d+", clean)]
            if len(nums) >= 2:
                result = sum(nums)
                if result.is_integer():
                    result = int(result)
                return str(result)
                
        # SUBTRACTION
        if any(k in clean for k in ["subtract", "minus", "difference"]):
            nums = [float(x) for x in re.findall(r"\d+\.\d+|\d+", clean)]
            if len(nums) >= 2:
                if "from" in clean:
                    result = nums[1] - nums[0]
                else:
                    result = nums[0] - nums[1]
                if result.is_integer():
                    result = int(result)
                return str(result)
                
        # MULTIPLICATION
        if any(k in clean for k in ["multiply", "times", "product"]):
            nums = [float(x) for x in re.findall(r"\d+\.\d+|\d+", clean)]
            if len(nums) >= 2:
                result = math.prod(nums)
                if result.is_integer():
                    result = int(result)
                return str(result)
                
        # DIVISION
        if any(k in clean for k in ["divide", "divided", "ratio", "quotient"]):
            nums = [float(x) for x in re.findall(r"\d+\.\d+|\d+", clean)]
            if len(nums) >= 2:
                if nums[1] == 0:
                    return "Error: Division by zero"
                result = nums[0] / nums[1]
                if result.is_integer():
                    result = int(result)
                return str(result)

        # 2. Conversational Power/Exponent
        if "square" in clean:
            nums = [float(x) for x in re.findall(r"\d+\.\d+|\d+", clean)]
            if len(nums) >= 1:
                result = nums[0] ** 2
                if result.is_integer():
                    result = int(result)
                return str(result)
        if any(k in clean for k in ["power", "exponent"]):
            nums = [float(x) for x in re.findall(r"\d+\.\d+|\d+", clean)]
            if len(nums) >= 2:
                result = nums[0] ** nums[1]
                if result.is_integer():
                    result = int(result)
                return str(result)

        # 3. Standard Mathematical Character Evaluator Fallback (e.g. "=2+2", "3.14 * 10^2", "2^3")
        # Strip common mathematical command phrasing
        for prefix in ["what is the value of", "what is the sum of", "what is the product of", "what is the difference of", "what is", "calculate", "compute", "result of", "value of", "solve", "?", "="]:
            clean = clean.replace(prefix, "")
            
        # Replace common mathematical terms with python-compatible operators
        clean = clean.replace("power", "**")
        clean = clean.replace("to the of", "**")
        clean = clean.replace("multiplied by", "*")
        clean = clean.replace("times", "*")
        clean = clean.replace("^", "**") # Handle power operator safely
        clean = re.sub(r"\bx\b", "*", clean) # Replace x as a multiplier safely
        clean = clean.replace("divided by", "/")
        clean = clean.replace("plus", "+")
        clean = clean.replace("minus", "-")
        
        clean = clean.strip()
        
        # Restrict strictly to digits, spaces, and safe math operators
        allowed_chars = set("0123456789+-*/.() ")
        
        # Try to extract the mathematical candidate if clean prompt has non-allowed chars (e.g., trailing words)
        if not all(c in allowed_chars for c in clean):
            candidates = re.findall(r"[\d\.\s\+\-\*\/\(\)]+", clean)
            for cand in candidates:
                cand_clean = cand.strip()
                if cand_clean and re.search(r"\d", cand_clean) and any(op in cand_clean for op in ["+", "-", "*", "/"]):
                    if all(c in allowed_chars for c in cand_clean):
                        clean = cand_clean
                        break
        
        if clean and all(c in allowed_chars for c in clean):
            try:
                # Evaluate in sandboxed math dictionary context
                result = eval(clean, {"__builtins__": None}, {})
                # Format to int if mathematically whole float
                if isinstance(result, float) and result.is_integer():
                    result = int(result)
                return str(result)
            except Exception:
                return None
        return None

    def _generate_live_low_stakes(self, prompt: str) -> str:
        """
        Queries the live Groq API for a direct, plain-text response for low-stakes queries.
        Bypasses any structured JSON requirements or reflection drawers.
        """
        import httpx
        api_key = os.environ.get("API_KEY")
        if not api_key:
            raise ValueError("API_KEY not found in environment.")
            
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        model = "llama-3.3-70b-versatile"
        
        system_prompt = (
            "You are a helpful assistant. The user is asking a direct, low-stakes question or transactional task. "
            "Generate a direct, clear, standard text response. Do not include any strategic synthesis, "
            "tradeoff analysis, or JSON structures. Just answer the query directly and concisely."
        )
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
        return result["choices"][0]["message"]["content"].strip()

    def generate_low_stakes(self, prompt: str) -> ChatResponse:
        low_stakes_responses = {
            "format": "Here is the cleaned and formatted bibliography in APA style:\n\n1. Maddala, N. (2026). *The Illusion of Authoritative Outputs*. Academic Press.",
            "clean": "Here is the cleaned script. Syntax errors have been corrected and indentation has been standardized.",
            "syntax": "The syntax error on line 4 was fixed. You were missing a closing parenthesis ')' before the colon.",
            "regex": "To match an email in regex, use the following pattern:\n`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`"
        }

        prompt_lower = prompt.lower()
        matched_text = None
        
        # 1. First, try to evaluate prompt as a dynamic math expression
        math_val = self.safe_eval_math(prompt)
        if math_val is not None:
            matched_text = math_val
        
        # 2. Second, try to query live LLM if API Key is present
        elif os.environ.get("API_KEY"):
            try:
                matched_text = self._generate_live_low_stakes(prompt)
            except Exception as e:
                print(f"Groq API call for low-stakes failed, falling back to stubs. Error: {str(e)}")

        # 3. Third, fallback to stubs if live API fails or is not present
        if matched_text is None:
            for key, resp in low_stakes_responses.items():
                if key in prompt_lower:
                    matched_text = resp
                    break

        if matched_text is None:
            matched_text = "Here is the output for your request. It has been processed and formatted successfully."

        return ChatResponse(
            response_text=matched_text,
            reflection_mode=ReflectionMode(status="inactive", highlights=[], modules=None)
        )

    def _generate_live_llm(self, prompt: str) -> ChatResponse:
        """
        True Groq API connection utilizing strict Structured JSON Outputs.
        """
        import httpx
        api_key = os.environ.get("API_KEY")
        if not api_key:
            raise ValueError("API_KEY not found in environment.")
            
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Deploy Llama 3.3 70B Versatile for blazing-fast inference
        model = "llama-3.3-70b-versatile"
        
        system_prompt = """
        You are an expert strategic reasoning AI. You must analyze the user prompt and generate a high-quality, comprehensive strategic response.
        Along with the response, you must extract 5 key reflection modules: assumptions, missing context gaps, uncertainty boundaries, alternative perspectives, and a critical human reflection question.
        For each reflection item, you must also identify a specific short keyphrase inside your response_text that corresponds to that reflection, and list it in 'highlights' with a unique id (e.g., 'hl-1', 'hl-2') and matching category ('assumption', 'alternative', 'uncertainty').
        
        CRITICAL INSTRUCTIONS:
        1. The text_span strings in the 'highlights' array MUST EXACTLY MATCH substring spans present inside your 'response_text' (case, spaces, and punctuation must match verbatim!). If they do not match exactly, the system will fail to link them.
        2. Write the core response_text in clear, professional paragraphs with double newlines separating them (e.g. \\n\\n).
        3. Make sure the reflection modules contain high-quality, deep, specific strategic reasoning.
        
        You must output a single, raw JSON object matching the following JSON schema:
        {
          "response_text": "A detailed, professional, paragraphs-separated analytical strategic response text.",
          "reflection_mode": {
            "status": "active",
            "highlights": [
              {
                "id": "hl-1",
                "text_span": "verbatim substring from your response_text",
                "category": "assumption"
              }
            ],
            "modules": {
              "assumptions": [
                { "summary": "...", "details": "..." }
              ],
              "missing_context": [
                { "summary": "...", "details": "..." }
              ],
              "uncertainty_boundary": [
                { "summary": "...", "details": "..." }
              ],
              "alternative_perspectives": [
                { "summary": "...", "details": "..." }
              ],
              "reflection_prompt": {
                "question": "A critical thinking question pushing the user to cross-examine."
              }
            }
          }
        }
        Do not wrap it in markdown block wrappers or add text explanations outside the JSON.
        """
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        
        with httpx.Client(timeout=45.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
        content_str = result["choices"][0]["message"]["content"]
        data = json.loads(content_str)
        
        # Validate Pydantic schema
        return ChatResponse(**data)

    def generate_strategic(self, prompt: str) -> ChatResponse:
        # Step 1: Check for active API Keys in .env (live Groq mode)
        if os.environ.get("API_KEY"):
            try:
                return self._generate_live_llm(prompt)
            except Exception as e:
                print(f"Groq API call failed, falling back to mock layer. Error: {str(e)}")

        # Step 2: Fallback to mock layers
        prompt_lower = prompt.lower()
        if "plg" in prompt_lower or "product-led" in prompt_lower or "saas" in prompt_lower:
            return self.plg_mock_response

        # Dynamic fallback strategic response
        clean_prompt = prompt.strip()
        return ChatResponse(
            response_text=(
                f"Evaluating the strategic implications for: '{clean_prompt}'.\n\n"
                f"Developing a robust model for this strategy requires analyzing core trade-offs, resource constraints, "
                f"and market dynamics. A centralized approach offers unified coordination, but decentralized execution "
                f"accelerates learning loops and improves responsiveness in highly volatile market environments.\n\n"
                f"We must weigh short-term adoption gains against the long-term defensibility of the business model. "
                f"Investing in strategic moats now ensures optionality and creates compounding advantages."
            ),
            reflection_mode=ReflectionMode(
                status="active",
                highlights=[
                    Highlight(id="hl-1", text_span="learning loops", category="assumption"),
                    Highlight(id="hl-2", text_span="defensibility of the business model", category="alternative"),
                    Highlight(id="hl-3", text_span="strategic moats", category="uncertainty")
                ],
                modules=ReflectionModules(
                    assumptions=[
                        AssumptionItem(
                            summary="Assumes uniform resource allocation",
                            details="Assumes the organization possesses enough parallel bandwidth to run execution cycles without bottlenecking other core streams."
                        ),
                        AssumptionItem(
                            summary="Assumes short learning loop cycles",
                            details="Underlying premise assumes user feedback is frequent enough to yield meaningful feedback data quickly."
                        )
                    ],
                    missing_context=[
                        ContextItem(
                            summary="No primary user research provided",
                            details="Lack of localized ethnographic or cohort feedback makes the assumption of behavioral adoption speculative."
                        ),
                        ContextItem(
                            summary="Limited capital expenditure details",
                            details="Omission of financial boundary constraints limits estimating the runway available to support model testing."
                        )
                    ],
                    uncertainty_boundary=[
                        UncertaintyItem(
                            summary="Confidence breaks down under high macro-volatility",
                            details="Confidence in these strategic projections decays rapidly if market macroeconomic parameters undergo severe shifts or capital access tightens."
                        )
                    ],
                    alternative_perspectives=[
                        AlternativeItem(
                            summary="Consolidated central leadership can outperform in early stages",
                            details="In high-ambiguity launch stages, central authority can drive faster decisions and avoid alignment friction compared to distributed team frameworks."
                        )
                    ],
                    reflection_prompt=ReflectionPrompt(
                        question="What structural changes would make this alternative model superior in your market segment?"
                    )
                )
            )
        )

    async def stream_strategic_chunks(self, prompt: str) -> AsyncGenerator[str, None]:
        """
        Server-Sent Events chunk generator.
        Streams text incrementally, yielding the JSON metadata at the end.
        """
        response_payload = self.generate_strategic(prompt)
        words = response_payload.response_text.split(" ")
        
        # Stream core response text word-by-word
        chunk_size = 3
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i+chunk_size])
            if i + chunk_size < len(words):
                chunk += " "
            
            # Format as an SSE SSE event carrying text fragment
            yield f"event: text\ndata: {json.dumps({'text': chunk})}\n\n"
            await asyncio.sleep(0.04) # Simulates high-speed generation latency
            
        await asyncio.sleep(0.1)

        # Yield final metadata envelope carrying reflection configurations
        metadata = {
            "status": response_payload.reflection_mode.status,
            "highlights": [hl.dict() for hl in response_payload.reflection_mode.highlights],
            "modules": response_payload.reflection_mode.modules.dict() if response_payload.reflection_mode.modules else None
        }
        
        yield f"event: reflection\ndata: {json.dumps(metadata)}\n\n"
        yield "event: done\ndata: {}\n\n"
