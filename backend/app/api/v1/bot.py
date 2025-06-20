from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db.database import quizzes_collection
from app.services.gemini_service import get_quiz_explanation
from app.dependencies import get_current_user
from bson import ObjectId  # ✅ This is required

router = APIRouter()

class BotRequest(BaseModel):
    quiz_id: str
    question_index: int
    question: str

@router.post("/ask")
async def ask_bot(request: BotRequest, current_user: dict = Depends(get_current_user)):
    # ✅ Convert string ID to ObjectId for MongoDB
    try:
        quiz_id_obj = ObjectId(request.quiz_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid quiz ID format")

    # ✅ Fetch quiz using ObjectId
    quiz = quizzes_collection.find_one({"_id": quiz_id_obj, "user_id": current_user.email})

    if not quiz or request.question_index >= len(quiz["questions"]):
        raise HTTPException(status_code=404, detail="Quiz or question not found")

    # ✅ Generate explanation using Gemini
    explanation = await get_quiz_explanation(
        request.quiz_id,
        request.question_index,
        request.question,
        quiz["questions"]
    )

    return {"answer": explanation}
