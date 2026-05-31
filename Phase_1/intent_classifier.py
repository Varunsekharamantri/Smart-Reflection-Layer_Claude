import re
import os
from typing import Dict, Any

class IntentClassifier:
    """
    Evaluates incoming user prompts on a spectrum of risk and ambiguity.
    Routes queries to either a Low-Stakes Path (operational/transactional) or
    a High-Stakes Path (strategic/synthesis) that triggers the Smart Reflection Layer.
    """

    # High-stakes keywords indicative of strategic planning, trade-offs, synthesis, or forecasting
    STRATEGIC_KEYWORDS = {
        r"\bplg\b", r"\bproduct[- ]led\b", r"\bsaas\b", r"\bpricing\b", r"\bcompetitor\b", 
        r"\bmonetiz(e|ation)\b", r"\bretention\b", r"\bchurn\b", r"\bcohort\b", r"\bmarket entry\b",
        r"\bstrategy\b", r"\broadmap\b", r"\broi\b", r"\bacv\b", r"\bltv\b", r"\bcac\b",
        r"\bprioritiz(e|ation)\b", r"\bcompetit(ive|ion)\b", r"\bpositioning\b", r"\bopportunity cost\b",
        r"\bval(ue|uation)\b", r"\bbusiness model\b", r"\bgo[- ]to[- ]market\b", r"\bgtm\b"
    }

    # Low-stakes keywords indicative of transactional formatting, clean up, basic code, or calculations
    OPERATIONAL_KEYWORDS = {
        r"\bformat\b", r"\bclean up\b", r"\bscript\b", r"\bsyntax\b", r"\btransl(ate|ation)\b",
        r"\bspell(check|ing)\b", r"\bregex\b", r"\bconvert\b", r"\bcalculat(e|ion)\b", 
        r"\bcsv\b", r"\bjson\b", r"\bpython\b", r"\bhtml\b", r"\bcss\b", r"\bcapitalize\b",
        r"\balphabetiz(e|ation)\b", r"\bindent\b", r"\bminify\b", r"\bprettify\b"
    }

    def __init__(self):
        # Compile regular expressions for maximum matching performance
        self.strategic_patterns = [re.compile(p, re.IGNORECASE) for p in self.STRATEGIC_KEYWORDS]
        self.operational_patterns = [re.compile(p, re.IGNORECASE) for p in self.OPERATIONAL_KEYWORDS]

    def classify(self, prompt: str) -> Dict[str, Any]:
        """
        Classifies the prompt. Returns a dictionary containing the routing decision
        and details of why the routing was chosen.
        
        Output structure:
        {
            "is_strategic": bool,
            "confidence": float,
            "reason": str,
            "matched_signals": list[str]
        }
        """
        if not prompt or not prompt.strip():
            return {
                "is_strategic": False,
                "confidence": 1.0,
                "reason": "Empty prompt defaulted to low-stakes routing.",
                "matched_signals": []
            }

        prompt_clean = prompt.strip()

        # Step 1: Run Keyword/Regex Heuristic Scanners
        matched_strategic = []
        matched_operational = []

        for pattern in self.strategic_patterns:
            matches = pattern.findall(prompt_clean)
            if matches:
                matched_strategic.append(pattern.pattern)

        for pattern in self.operational_patterns:
            matches = pattern.findall(prompt_clean)
            if matches:
                matched_operational.append(pattern.pattern)

        # Step 2: Live LLM Classification Fallback (if API keys are available)
        # In a real environment, if we have active Gemini/OpenAI keys, we could run a fast zero-shot classifier.
        # For Phase 1, we implement the local heuristics with mock LLM hooks.
        has_api_keys = any(k in os.environ for k in ["OPENAI_API_KEY", "GEMINI_API_KEY", "ANTHROPIC_API_KEY"])

        # Mathematical / Arithmetic check (e.g., "what is 2 power 2", "3 + 5", "calculate square root of 9", "add 2 and 2")
        has_math_symbols = bool(re.search(r"[\+\-\*\/\^=]", prompt_clean))
        has_math_words = bool(re.search(r"\b(add|sum|plus|subtract|minus|difference|multiply|times|product|divide|divided|ratio|quotient|power|square|sqrt|root|log|sin|cos|tan)\b", prompt_clean.lower()))
        has_numbers = bool(re.search(r"\b\d+\b", prompt_clean))
        
        is_math_query = (has_numbers and (has_math_symbols or has_math_words) and not matched_strategic) or (has_math_symbols and not matched_strategic)

        # Check questioning and analytical indicators
        word_count = len(prompt_clean.split())
        question_words = {"should", "how", "evaluate", "analyze", "why", "what", "compare", "explain", "describe", "tell", "can", "is", "are", "would"}
        analytical_words = {"risk", "impact", "pros", "cons", "benefit", "plan", "future", "strategic", "decide", "growth", "opportunity", "moat"}
        
        has_question_structure = any(prompt_clean.lower().startswith(q) for q in question_words)
        has_analytical_terms = any(w in prompt_clean.lower() for w in analytical_words)

        # DETERMINING ROUTING LOGIC (PRECISION RANKED):
        
        # 1. Operational formatting signals override strategic keywords to prevent UX noise
        # E.g., "Format a slide detailing our SaaS product PLG strategy assumptions"
        if matched_operational:
            return {
                "is_strategic": False,
                "confidence": 0.85,
                "reason": "Prompt matches operational keywords. Formatting and calculations bypass strategic reflection.",
                "matched_signals": matched_operational + matched_strategic
            }

        # 2. Mathematical/Arithmetic checks route to operational low-stakes immediately
        if is_math_query:
            return {
                "is_strategic": False,
                "confidence": 0.90,
                "reason": "Arithmetic pattern or mathematical terms detected.",
                "matched_signals": ["math_query"]
            }

        # 3. Explicit strategic keywords found -> High-Stakes
        if matched_strategic:
            return {
                "is_strategic": True,
                "confidence": 0.95,
                "reason": f"Strategic research intent detected ({', '.join(matched_strategic)}).",
                "matched_signals": matched_strategic
            }

        # 4. Fallback rule: Strategic questioning structure or descriptive length
        # ONLY routes to High-Stakes if there are accompanying strategic or analytical signals
        if (has_question_structure or word_count > 8) and (has_analytical_terms or matched_strategic):
            return {
                "is_strategic": True,
                "confidence": 0.85,
                "reason": "Analytical structure or strategic questioning combined with strategic context detected.",
                "matched_signals": ["question_structure", "analytical_context"]
            }

        # 5. Default fallback -> Low-Stakes
        return {
            "is_strategic": False,
            "confidence": 0.80,
            "reason": "Generic short greeting or query defaulted to standard operational path.",
            "matched_signals": []
        }
