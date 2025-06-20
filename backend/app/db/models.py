from pydantic import BaseModel, EmailStr
from typing import List, Dict, Any, Optional

class UserInDB(BaseModel):
    email: EmailStr
    name: str
    hashed_password: Optional[str] = None
    google_id: Optional[str] = None

class QuizInDB(BaseModel):
    user_id: str
    level: str
    questions: List[Dict[str, Any]]
    score: Optional[int] = None
    answers: Optional[Dict[str, int]] = None

class SubmitQuizRequest(BaseModel):
    quiz_id: str
    answers: Dict[str, int]  # keys should be strings ("0", "1", etc.)
