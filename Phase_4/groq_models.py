"""Groq chat helper that survives model retirements.

Asks Groq which models are live (cached ~1h), tries the preferred ones first,
and falls back to any other live chat model. Override with GROQ_MODEL.
Groq retired llama-3.3-70b-versatile on 2026-08-16 (console.groq.com/docs/deprecations).
"""

import os
import time
from typing import Optional, Tuple

import httpx

BASE_URL = "https://api.groq.com/openai/v1"
PREFERRED_MODELS = ("openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b")
_NOT_CHAT = ("whisper", "tts", "orpheus", "guard", "safeguard", "embed", "playai", "compound")
_CACHE_SECONDS = 3600
_available = {"at": 0.0, "ids": None}
last_used = {"model": None}


class GroqKeyRejected(Exception):
    pass


def get_api_key() -> Optional[str]:
    for name in ("GROQ_API_KEY", "API_KEY"):
        value = (os.environ.get(name) or "").strip().strip('"').strip("'")
        if value:
            return value
    return None


def preferred_models():
    override = (os.environ.get("GROQ_MODEL") or "").strip()
    models = [override] if override else []
    return models + [m for m in PREFERRED_MODELS if m not in models]


def _live_models(api_key: str):
    now = time.time()
    if _available["ids"] is not None and now - _available["at"] < _CACHE_SECONDS:
        return _available["ids"]
    try:
        r = httpx.get(f"{BASE_URL}/models", headers={"Authorization": f"Bearer {api_key}"}, timeout=10.0)
        r.raise_for_status()
        ids = [m["id"] for m in r.json().get("data", [])]
    except Exception:
        return _available["ids"]
    _available.update(at=now, ids=ids)
    return ids


def model_candidates(api_key: str):
    wanted = preferred_models()
    live = _live_models(api_key)
    if not live:
        return wanted
    chosen = [m for m in wanted if m in live]
    others = sorted(m for m in live if m not in chosen and not any(t in m.lower() for t in _NOT_CHAT))
    others.sort(key=lambda m: 0 if "gpt-oss" in m else 1 if "llama" in m else 2 if "qwen" in m else 3)
    return chosen + others


def groq_chat(payload: dict, timeout: float = 45.0, api_key: Optional[str] = None) -> dict:
    """POST a chat completion, trying live models in order. Returns the JSON response."""
    api_key = api_key or get_api_key()
    if not api_key:
        raise ValueError("No Groq key set (GROQ_API_KEY or API_KEY).")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    last_error = None
    with httpx.Client(timeout=timeout) as client:
        for model in model_candidates(api_key)[:6]:
            body = dict(payload, model=model)
            if model.startswith("openai/gpt-oss"):
                body["reasoning_effort"] = "low"  # keep the token budget for the answer
            r = client.post(f"{BASE_URL}/chat/completions", headers=headers, json=body)
            if r.status_code == 400 and "reasoning" in r.text.lower() and "reasoning_effort" in body:
                body.pop("reasoning_effort")
                r = client.post(f"{BASE_URL}/chat/completions", headers=headers, json=body)
            if r.status_code in (401, 403):
                raise GroqKeyRejected("Groq rejected the key (invalid, expired or revoked).")
            if r.status_code in (400, 404):
                last_error = RuntimeError(f"{model}: {r.text[:200]}")
                _available["at"] = 0.0  # re-discover live models next time
                continue
            r.raise_for_status()
            last_used["model"] = model
            return r.json()
    raise last_error or RuntimeError("No usable Groq chat model is available.")


def check_groq() -> Tuple[str, str]:
    """Returns (status, detail); status is 'ok', 'degraded' or 'error'."""
    if not get_api_key():
        return "error", "No Groq key set. Add GROQ_API_KEY (or API_KEY) in Vercel environment variables."
    try:
        groq_chat({"messages": [{"role": "user", "content": "ping"}], "max_tokens": 64}, timeout=20.0)
    except GroqKeyRejected as e:
        return "error", f"{e} Create a new key and update it in Vercel."
    except Exception as e:
        return "error", f"Groq call failed: {e}"
    used, want = last_used["model"], preferred_models()[0]
    if used != want:
        return "degraded", f"Working, but preferred model '{want}' is unavailable; using '{used}'."
    return "ok", f"Groq key accepted; using '{used}'."
