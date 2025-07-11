from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.MONGO_URI)
db = client.get_database()
users_collection = db["users"]
quizzes_collection = db["quizzes"]