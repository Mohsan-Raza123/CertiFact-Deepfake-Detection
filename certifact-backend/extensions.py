from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

# Initialize extensions (but don't attach to app yet)
bcrypt = Bcrypt()
jwt = JWTManager()

# Shared Database Connection
MONGO_URI = "mongodb+srv://mohsin1:mohsin12@certi-fact-db.xnw07ls.mongodb.net/certifact?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["certifact"]
    print("✅ Extensions: Database connected")
except Exception as e:
    print(f"🔥 Extensions: Database connection failed: {e}")