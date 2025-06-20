from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.services.gemini_service import generate_quiz_questions
from app.dependencies import get_current_user
from app.db.database import quizzes_collection
from app.db.models import SubmitQuizRequest, UserInDB
from bson import ObjectId

router = APIRouter()

@router.post("/generate")
async def generate_quiz(data: dict, current_user: UserInDB = Depends(get_current_user)):
    level = data.get("level", "easy")
    try:
        questions = await generate_quiz_questions(level)
        quiz_doc = {
            "user_id": current_user.email,  # ✅ FIXED
            "level": level,
            "questions": questions,
            "answers": {},
            "score": None,
        }
        inserted = quizzes_collection.insert_one(quiz_doc)
        quiz_id = str(inserted.inserted_id)

        return JSONResponse(content={"quiz_id": quiz_id, "level": level, "questions": questions})

    except Exception as e:
        print("❌ Unexpected error in /generate:", e)
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.post("/submit")
async def submit_quiz(payload: SubmitQuizRequest, current_user: UserInDB = Depends(get_current_user)):
    try:
        print("📥 Received submit payload:", payload)

        quiz = quizzes_collection.find_one({
            "_id": ObjectId(payload.quiz_id),
            "user_id": current_user.email  # ✅ FIXED
        })

        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        correct = 0
        for index_str, selected in payload.answers.items():
            index = int(index_str)
            if (
                0 <= index < len(quiz["questions"])
                and selected == quiz["questions"][index]["correct_answer"]
            ):
                correct += 1

        score = correct

        quizzes_collection.update_one(
            {"_id": ObjectId(payload.quiz_id)},
            {"$set": {"answers": payload.answers, "score": score}}
        )

        return JSONResponse(content={
        "score": score,
        "total": len(quiz["questions"]),
        "answers": payload.answers  # ✅ Include answers in response
})


    except Exception as e:
        print("❌ Error in submit_quiz:", e)
        raise HTTPException(status_code=500, detail="Failed to submit quiz.")
