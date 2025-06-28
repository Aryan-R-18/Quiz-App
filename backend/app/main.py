from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, quiz, bot

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quiz-app-opal-ten.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(quiz.router, prefix="/api/v1/quiz", tags=["quiz"])
app.include_router(bot.router, prefix="/api/v1/bot", tags=["bot"])

@app.get("/")
async def root():
    return {"message": "Quiz App Backend"}