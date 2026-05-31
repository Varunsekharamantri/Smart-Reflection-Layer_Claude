import re
import os
import hashlib
from typing import Dict, Any, Set, Optional

class StrategicClassifierCache:
    """
    Performance cache to store common strategic prompt signatures.
    Bypasses deep regex operations, returning sub-millisecond routing checks.
    """
    def __init__(self):
        # Cache for exact matching of highly common user strategic queries
        self._cache: Dict[str, Dict[str, Any]] = {}
        
        # Populate cache with default golden strategically matched seeds
        self.seed_cache("Should I prioritize PLG growth for our B2B SaaS product?", True, "strategic_plg_seed")
        self.seed_cache("Evaluate the market entry risks for our new platform", True, "strategic_entry_seed")

    def get_md5_hash(self, text: str) -> str:
        return hashlib.md5(text.lower().strip().encode('utf-8')).hexdigest()

    def lookup(self, prompt: str) -> Optional[Dict[str, Any]]:
        signature = self.get_md5_hash(prompt)
        return self._cache.get(signature, None)

    def seed_cache(self, prompt: str, is_strategic: bool, matched_signal: str):
        signature = self.get_md5_hash(prompt)
        self._cache[signature] = {
            "is_strategic": is_strategic,
            "confidence": 1.0,
            "reason": f"Cached routing signature hit ({matched_signal}).",
            "matched_signals": [matched_signal]
        }


class IntentClassifier:
    """
    Evaluates incoming user prompts on a spectrum of risk and ambiguity.
    Routes queries to either a Low-Stakes Path or a High-Stakes Path.
    Includes Phase 4 sub-millisecond caching pre-computation.
    """

    STRATEGIC_KEYWORDS = {
        r"\bplg\b", r"\bproduct[- ]led\b", r"\bsaas\b", r"\bpricing\b", r"\bcompetitor\b", 
        r"\bmonetiz(e|ation)\b", r"\bretention\b", r"\bchurn\b", r"\bcohort\b", r"\bmarket entry\b",
        r"\bstrategy\b", r"\broadmap\b", r"\broi\b", r"\bacv\b", r"\bltv\b", r"\bcac\b",
        r"\bprioritiz(e|ation)\b", r"\bcompetit(ive|ion)\b", r"\bpositioning\b", r"\bopportunity cost\b",
        r"\bval(ue|uation)\b", r"\bbusiness model\b", r"\bgo[- ]to[- ]market\b", r"\bgtm\b"
    }

    OPERATIONAL_KEYWORDS = {
        r"\bformat\b", r"\bclean up\b", r"\bscript\b", r"\bsyntax\b", r"\btransl(ate|ation)\b",
        r"\bspell(check|ing)\b", r"\bregex\b", r"\bconvert\b", r"\bcalculat(e|ion)\b", 
        r"\bcsv\b", r"\bjson\b", r"\bpython\b", r"\bhtml\b", r"\bcss\b", r"\bcapitalize\b",
        r"\balphabetiz(e|ation)\b", r"\bindent\b", r"\bminify\b", r"\bprettify\b"
    }

    def __init__(self):
        self.strategic_patterns = [re.compile(p, re.IGNORECASE) for p in self.STRATEGIC_KEYWORDS]
        self.operational_patterns = [re.compile(p, re.IGNORECASE) for p in self.OPERATIONAL_KEYWORDS]
        
        # Initialize sub-millisecond lookup cache
        self.cache = StrategicClassifierCache()

    def classify(self, prompt: str) -> Dict[str, Any]:
        """
        Classifies incoming prompt. Incorporates caching lookups and mathematical check.
        """
        if not prompt or not prompt.strip():
            return {
                "is_strategic": False,
                "confidence": 1.0,
                "reason": "Empty prompt defaulted to low-stakes routing.",
                "matched_signals": []
            }

        prompt_clean = prompt.strip()

        # Step 1: Pre-computed Lookup Cache Check
        cached_result = self.cache.lookup(prompt_clean)
        if cached_result:
            return cached_result

        # Step 2: Heuristic Regex Scanners
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

        # Mathematical / Arithmetic check (e.g., "what is 2 power 2", "3 + 5", "calculate square root of 9", "add 2 and 2")
        has_math_symbols = bool(re.search(r"[\+\-\*\/\^=]", prompt_clean))
        has_math_words = bool(re.search(r"\b(add|sum|plus|subtract|minus|difference|multiply|times|product|divide|divided|ratio|quotient|power|square|sqrt|root|log|sin|cos|tan)\b", prompt_clean.lower()))
        has_numbers = bool(re.search(r"\b\d+\b", prompt_clean))
        
        is_math_query = (has_numbers and (has_math_symbols or has_math_words) and not matched_strategic) or (has_math_symbols and not matched_strategic)

        # Fuzzy concatenated strategic boundary check (handles typos/lack of spaces like marketsixeofturfbusinessinIndia)
        fuzzy_strategic_roots = {"market", "business", "turf", "plg", "pricing", "saas", "growth", "strategy", "compet", "monetiz", "product-led", "revenue"}
        has_fuzzy_strategic = any(root in prompt_clean.lower() for root in fuzzy_strategic_roots)

        # Check questioning and analytical indicators
        word_count = len(prompt_clean.split())
        question_words = {"should", "how", "evaluate", "analyze", "why", "what", "compare", "explain", "describe", "tell", "can", "is", "are", "would"}
        analytical_words = {"risk", "impact", "pros", "cons", "benefit", "plan", "future", "strategic", "decide", "growth", "opportunity", "moat"}
        
        has_question_structure = any(prompt_clean.lower().startswith(q) for q in question_words)
        has_analytical_terms = any(w in prompt_clean.lower() for w in analytical_words)

        # DETERMINING ROUTING LOGIC (PRECISION RANKED):
        
        # 1. Operational formatting signals override strategic keywords/fuzzy roots to prevent UX noise
        # E.g., "Format a slide detailing our SaaS product PLG strategy assumptions"
        if matched_operational:
            res = {
                "is_strategic": False,
                "confidence": 0.85,
                "reason": "Prompt matches operational keywords. Formatting and calculations bypass strategic reflection.",
                "matched_signals": matched_operational + matched_strategic
            }
            self.cache.seed_cache(prompt_clean, False, "heuristic_low_stakes")
            return res

        # 2. Mathematical/Arithmetic checks route to operational low-stakes immediately
        if is_math_query:
            res = {
                "is_strategic": False,
                "confidence": 0.90,
                "reason": "Arithmetic pattern or mathematical terms detected.",
                "matched_signals": ["math_query"]
            }
            self.cache.seed_cache(prompt_clean, False, "math_low_stakes")
            return res

        # 3. Explicit strategic keywords found -> High-Stakes
        if matched_strategic:
            res = {
                "is_strategic": True,
                "confidence": 0.95,
                "reason": f"Strategic research intent detected ({', '.join(matched_strategic)}).",
                "matched_signals": matched_strategic
            }
            self.cache.seed_cache(prompt_clean, True, "heuristic_high_stakes")
            return res

        # 4. Fuzzy strategic roots found -> High-Stakes
        if has_fuzzy_strategic:
            res = {
                "is_strategic": True,
                "confidence": 0.90,
                "reason": "Strategic root term matched fuzzy boundary analysis.",
                "matched_signals": ["fuzzy_strategic_root"]
            }
            self.cache.seed_cache(prompt_clean, True, "fuzzy_high_stakes")
            return res

        # 5. Fallback rule: Strategic questioning structure or descriptive length
        # ONLY routes to High-Stakes if there are accompanying strategic or analytical signals
        if (has_question_structure or word_count > 8) and (has_analytical_terms or has_fuzzy_strategic or matched_strategic):
            res = {
                "is_strategic": True,
                "confidence": 0.85,
                "reason": "Analytical structure or strategic questioning combined with strategic context detected.",
                "matched_signals": ["question_structure", "analytical_context"]
            }
            self.cache.seed_cache(prompt_clean, True, "structure_high_stakes")
            return res

        # 6. Default fallback -> Low-Stakes
        res = {
            "is_strategic": False,
            "confidence": 0.80,
            "reason": "Generic short greeting or query defaulted to standard operational path.",
            "matched_signals": []
        }
        self.cache.seed_cache(prompt_clean, False, "default_low_stakes")
        return res
