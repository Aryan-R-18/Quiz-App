from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth_service import login_user, google_login, signup_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

@router.post("/login")
async def login(request: LoginRequest):
    return await login_user(request.email, request.password)

@router.post("/google")
async def google_auth(request: GoogleLoginRequest):
    return await google_login(request.credential)

@router.post("/signup")
async def signup(request: SignupRequest):
    return await signup_user(request.email, request.password, request.name)