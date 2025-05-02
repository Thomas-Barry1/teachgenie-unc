import pytest
from fastapi.testclient import TestClient
from main import app
import google.generativeai as genai
import os


client = TestClient(app)

FAKE_RESPONSE = "Here is a mock test with sample questions."


# --- MonkeyPatch for ask_model (used in categorization, assessment) ---
@pytest.fixture
def mock_ask_model(monkeypatch):
    def fake_ask_model(given_model, prompt):
        return FAKE_RESPONSE
    monkeypatch.setattr("main.ask_model", fake_ask_model)


# --- MonkeyPatch for the Gemini model used in generate_content ---
@pytest.fixture
def mock_model_generate(monkeypatch):
    class FakeResponse:
        @property
        def text(self):
            return FAKE_RESPONSE

    class FakeModel:
        def generate_content(self, prompt):
            return FakeResponse()

    monkeypatch.setattr("main.model", FakeModel())


# -------------------------- /api/test --------------------------

def test_generate_test_basic(mock_model_generate):
    payload = {
        "topic": "Photosynthesis"
    }
    response = client.post("/api/test", json=payload)
    assert response.status_code == 200
    assert response.json()["test"] == FAKE_RESPONSE

def test_generate_test_full(mock_model_generate):
    payload = {
        "topic": "Algebra",
        "numberOfQuestions": "5",
        "gradeLevel": "8",
        "commonCoreStandards": "CCSS.MATH.CONTENT.8.EE.A.1",
        "skills": "Exponents",
        "questionType": ["Multiple Choice", "True/False"],
        "state": "NY",
        "standards": None,
    }
    response = client.post("/api/test", json=payload)
    assert response.status_code == 200
    assert response.json()["test"] == FAKE_RESPONSE


# -------------------------- /api/gap-test --------------------------

def test_generate_gap_test(mock_model_generate):
    payload = {
        "topic": "Grammar",
        "standards": "L.4.1.A, L.4.1.B",
        "numberOfQuestions": "3",
        "gradeLevel": "4",
        "commonCoreStandards": "CCSS.ELA-LITERACY.L.4.1",
        "skills": "sentence structure",
        "questionType": ["Multiple Choice"],
        "state": "CA",
    }
    response = client.post("/api/gap-test", json=payload)
    assert response.status_code == 200
    assert response.json()["test"] == FAKE_RESPONSE


# -------------------------- /api/gap-assessment --------------------------

def test_gap_assessment_single_question(mock_ask_model):
    full_questions = [
        {
            "question": {
                "question": "What is the capital of France?",
                "answerChoices": ["Paris", "Berlin", "Madrid"],
                "correctAnswer": "Paris"
            },
            "selected_answer": "Paris"
        }
    ]
    response = client.post("/api/gap-assessment", json=full_questions)
    assert response.status_code == 200
    data = response.json()
    assert "category_final_grades" in data
    assert "gap_assessment" in data
    assert "overallStrength" in data["gap_assessment"]


def test_gap_assessment_multiple_questions(mock_ask_model):
    full_questions = [
        {
            "question": {
                "question": "What is 10 + 5?",
                "answerChoices": ["10", "15", "20"],
                "correctAnswer": "15"
            },
            "selected_answer": "15"
        },
        {
            "question": {
                "question": "What planet is known as the Red Planet?",
                "answerChoices": ["Earth", "Mars", "Jupiter"],
                "correctAnswer": "Mars"
            },
            "selected_answer": "Mars"
        }
    ]
    response = client.post("/api/gap-assessment", json=full_questions)
    assert response.status_code == 200
    data = response.json()
    assert "category_final_grades" in data
    assert isinstance(data["category_final_grades"], dict)
    assert "gap_assessment" in data


# -------------------------- /api/gap-standards --------------------------

def test_generate_standards(mock_model_generate):
    payload = {
        "topic": "Chemistry",
        "gradeLevel": "10",
        "commonCoreStandards": "NGSS.HS.PS1.A",
        "skills": "chemical reactions",
        "state": "TX",
    }
    response = client.post("/api/gap-standards", json=payload)
    assert response.status_code == 200
    assert response.json()["standards"] == FAKE_RESPONSE


# -------------------------- /api/auth/google --------------------------

def test_google_auth_post():
    payload = {
        "topic": "History",
        "numberOfQuestions": "4",
        "gradeLevel": "7",
        "commonCoreStandards": "",
        "skills": "critical thinking",
        "questionType": ["Short Answer"],
        "state": "IL",
        "standards": None,
    }
    response = client.post("/api/auth/google", json=payload)
    assert response.status_code == 200
    assert response.json() is True

# Testing output structure
def test_gap_assessment_response_structure():
    full_questions = [
        {
            "question": {
                "question": "What is the process by which plants make their food?",
                "answerChoices": ["Photosynthesis", "Respiration", "Transpiration"],
                "correctAnswer": "Photosynthesis"
            },
            "selected_answer": "Photosynthesis"
        },
        {
            "question": {
                "question": "Which gas is essential for photosynthesis?",
                "answerChoices": ["Oxygen", "Carbon Dioxide", "Nitrogen"],
                "correctAnswer": "Carbon Dioxide"
            },
            "selected_answer": "Oxygen"
        }
    ]
    response = client.post("/api/gap-assessment", json=full_questions)
    assert response.status_code == 200
    data = response.json()
    assert "category_final_grades" in data
    assert "gap_assessment" in data
    gap_assessment = data["gap_assessment"]
    assert "overallStrength" in gap_assessment
    assert "performanceSummary" in gap_assessment
    assert "standardsPerformance" in gap_assessment
    assert "improvementPlan" in gap_assessment