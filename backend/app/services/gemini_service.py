import json
import re
import google.generativeai as genai
from app.core.config import settings
from fastapi import HTTPException
from starlette.concurrency import run_in_threadpool
import traceback

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Thread-safe wrapper
def _generate_response_sync(prompt: str):
    return model.generate_content(prompt)

# Generate quiz questions
async def generate_quiz_questions(level: str):
    prompt = f"""
    Generate 10 quiz questions for a {level} level quiz. Each question should have:
    - A clear question text
    - Four multiple-choice options
    - The index of the correct answer (0-3)
    Format the response as a JSON object with a list of questions, each containing:
    - question: string
    - options: list of 4 strings
    - correct_answer: integer (0-3)
    """

    try:
        print("🚀 [Gemini] Generating quiz for level:", level)
        response = await run_in_threadpool(_generate_response_sync, prompt)
        raw_text = response.text.strip()
        print("✅ [Gemini] Raw response:\n", raw_text)

        clean_text = re.sub(r"^```(?:json)?|```$", "", raw_text, flags=re.MULTILINE).strip()
        quiz_data = json.loads(clean_text)

        if not isinstance(quiz_data, dict) or "questions" not in quiz_data:
            raise ValueError("Expected a JSON object with a 'questions' key.")

        return quiz_data["questions"]

    except Exception as e:
        print("❌ Error generating quiz questions:", e)
        traceback.print_exc()
        raise HTTPException(status_code=503, detail="Failed to generate quiz questions.")


# Explanation (used in /ask)
async def get_quiz_explanation(quiz_id: str, question_index: int, question: str, questions: list):
    if not any(word in question.lower() for word in ["why", "how", "explain", "what"]):
        return "❗ I can only answer quiz-related questions. Please ask something about the quiz."

    try:
        question_data = questions[question_index]
        prompt = f"""
        Provide a detailed explanation for the following quiz question:

        Question {question_index + 1}: {question_data['question']}
        Options: {', '.join(question_data['options'])}
        Correct Answer: {question_data['options'][question_data['correct_answer']]}

        User's question: {question}
        """
        response = await run_in_threadpool(_generate_response_sync, prompt)
        return response.text.strip()

    except Exception as e:
        print("❌ Error generating explanation:", e)
        return "An error occurred while generating the explanation."
