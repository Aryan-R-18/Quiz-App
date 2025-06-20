from fastapi import HTTPException, status
from app.db.database import users_collection
from app.core.security import verify_password, get_password_hash, create_access_token
from app.db.models import UserInDB
import google.auth.transport.requests
from google.oauth2 import id_token
from app.core.config import settings


async def login_user(email: str, password: str):
    user = users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"email": email, "name": user["name"]})
    return {"token": token}

async def google_login(credential: str):
    try:
        print("🔐 Received Google Credential:", credential[:30] + "...")  # truncate for safety

        idinfo = id_token.verify_oauth2_token(
            credential,
            google.auth.transport.requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        print("✅ Token Verified. ID Info:", idinfo)

        email = idinfo["email"]
        name = idinfo["name"]

        user = users_collection.find_one({"email": email})
        if not user:
            user_data = UserInDB(email=email, name=name, google_id=idinfo["sub"]).dict()
            users_collection.insert_one(user_data)

        token = create_access_token({"email": email, "name": name})
        return {"token": token}

    except ValueError as e:
        print("❌ Google token verification failed:", str(e))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")


async def signup_user(email: str, password: str, name: str):
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    hashed_password = get_password_hash(password)
    user_data = UserInDB(email=email, name=name, hashed_password=hashed_password).dict()
    users_collection.insert_one(user_data)
    token = create_access_token({"email": email, "name": name})
    return {"token": token}