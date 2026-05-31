import unittest
import os
import json
from fastapi.testclient import TestClient

from Phase_1.intent_classifier import IntentClassifier
from Phase_1.reflective_engine import ReflectiveEngine, ChatResponse
from Phase_1.api import app

class TestSmartReflectionLayer(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Load the Golden Dataset
        dataset_path = os.path.join(os.path.dirname(__file__), "eval_dataset.json")
        with open(dataset_path, "r") as f:
            cls.dataset = json.load(f)
        
        # Initialize Services
        cls.classifier = IntentClassifier()
        cls.engine = ReflectiveEngine()
        cls.client = TestClient(app)

    # ==========================================
    # 1. Intent Classifier Tests
    # ==========================================
    
    def test_strategic_intent_classification(self):
        """
        Verify that all strategic prompts in the Golden Dataset route to the strategic path.
        """
        for item in self.dataset["strategic"]:
            prompt = item["prompt"]
            result = self.classifier.classify(prompt)
            self.assertTrue(
                result["is_strategic"], 
                f"Strategic prompt failed routing: '{prompt}'. Reason: {result['reason']}"
            )
            self.assertGreaterEqual(result["confidence"], 0.70)

    def test_operational_intent_classification(self):
        """
        Verify that all operational prompts in the Golden Dataset route to the operational path.
        """
        for item in self.dataset["operational"]:
            prompt = item["prompt"]
            result = self.classifier.classify(prompt)
            self.assertFalse(
                result["is_strategic"], 
                f"Operational prompt incorrectly routed as strategic: '{prompt}'. Reason: {result['reason']}"
            )
            self.assertGreaterEqual(result["confidence"], 0.80)

    def test_classifier_conflict_resolution(self):
        """
        Verify that prompts containing strategic keywords but operational actions (e.g., "format a SaaS slide")
        are correctly routed to the low-stakes operational path to prevent UX noise.
        """
        conflicting_prompt = "Format a slide detailing our SaaS product PLG strategy assumptions."
        result = self.classifier.classify(conflicting_prompt)
        self.assertFalse(
            result["is_strategic"],
            "Operational action formatting should override strategic topic keywords."
        )

    def test_classifier_empty_input(self):
        """
        Verify classifier behaves gracefully with empty inputs.
        """
        result = self.classifier.classify("   ")
        self.assertFalse(result["is_strategic"])
        self.assertEqual(result["confidence"], 1.0)

    # ==========================================
    # 2. Reflective Engine Schema Validation
    # ==========================================
    
    def test_low_stakes_generation_payload(self):
        """
        Verify low-stakes responses suppress the reflection layer fully.
        """
        response = self.engine.generate_low_stakes("Format this text")
        self.assertIsInstance(response, ChatResponse)
        self.assertEqual(response.reflection_mode.status, "inactive")
        self.assertEqual(len(response.reflection_mode.highlights), 0)
        self.assertIsNone(response.reflection_mode.modules)

    def test_strategic_generation_payload(self):
        """
        Verify strategic responses return active reflection parameters matching schema constraints.
        """
        response = self.engine.generate_strategic("Should I prioritize PLG growth for our B2B SaaS product?")
        self.assertIsInstance(response, ChatResponse)
        
        # Check overall flags
        ref_mode = response.reflection_mode
        self.assertEqual(ref_mode.status, "active")
        self.assertIsNotNone(ref_mode.modules)
        self.assertGreater(len(ref_mode.highlights), 0)
        
        # Verify specific modules exist
        modules = ref_mode.modules
        self.assertGreater(len(modules.assumptions), 0)
        self.assertGreater(len(modules.missing_context), 0)
        self.assertGreater(len(modules.uncertainty_boundary), 0)
        self.assertGreater(len(modules.alternative_perspectives), 0)
        self.assertIsNotNone(modules.reflection_prompt.question)

    def test_highlight_text_linkage_integrity(self):
        """
        CRITICAL TEST: Verify all highlights' text_spans exist verbatim within response_text
        to guarantee dynamic frontend rendering can anchor lines and highlight nodes successfully.
        """
        response = self.engine.generate_strategic("Should I prioritize PLG growth?")
        response_text = response.response_text
        
        for hl in response.reflection_mode.highlights:
            span = hl.text_span
            self.assertIn(
                span, 
                response_text, 
                f"Highlight span '{span}' does not exist inside response text. Frontend rendering will fail to link!"
            )

    # ==========================================
    # 3. HTTP API Routing Tests
    # ==========================================
    
    def test_api_health_endpoint(self):
        """
        Verify heartbeat health check works.
        """
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_api_chat_route_strategic(self):
        """
        Verify HTTP POST to /api/chat successfully executes and validates strategic prompts.
        """
        payload = {"prompt": "Should we transition to a SaaS consumption-based pricing strategy?"}
        response = self.client.post("/api/chat", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Validate existence of Pydantic response properties
        self.assertIn("response_text", data)
        self.assertIn("reflection_mode", data)
        self.assertEqual(data["reflection_mode"]["status"], "active")
        self.assertIsNotNone(data["reflection_mode"]["modules"])

    def test_api_chat_route_operational(self):
        """
        Verify HTTP POST to /api/chat successfully executes and routes operational prompts.
        """
        payload = {"prompt": "Prettify this JSON block."}
        response = self.client.post("/api/chat", json=payload)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("response_text", data)
        self.assertEqual(data["reflection_mode"]["status"], "inactive")
        self.assertIsNone(data["reflection_mode"]["modules"])

    def test_api_chat_empty_prompt_error(self):
        """
        Verify API returns HTTP 400 when sending empty prompt.
        """
        payload = {"prompt": "   "}
        response = self.client.post("/api/chat", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_math_evaluation(self):
        """
        Verify that mathematical operations route to operational and return calculated direct response.
        """
        math_prompts = [
            ("=2+2", "4"),
            ("what is 2+2", "4"),
            ("2*32", "64"),
            ("what is 2*32", "64"),
            ("2^3", "8"),
            ("add 2 and 2", "4"),
            ("what is 2^2 today", "4"),
            ("sum of 2, 3 and 4", "9")
        ]
        for prompt, expected in math_prompts:
            # Test classifier
            classification = self.classifier.classify(prompt)
            self.assertFalse(classification["is_strategic"], f"Math query incorrectly classified as strategic: {prompt}")
            
            # Test engine response
            response = self.engine.generate_low_stakes(prompt)
            self.assertEqual(response.response_text, expected, f"Math query did not evaluate directly: {prompt}. Got: {response.response_text}")

            # Test HTTP API
            api_resp = self.client.post("/api/chat", json={"prompt": prompt})
            self.assertEqual(api_resp.status_code, 200)
            data = api_resp.json()
            self.assertEqual(data["response_text"], expected, f"HTTP API response mismatch for: {prompt}")
            self.assertEqual(data["reflection_mode"]["status"], "inactive")

if __name__ == "__main__":
    unittest.main()
