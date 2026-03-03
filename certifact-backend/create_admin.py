from pymongo import MongoClient
from flask_bcrypt import Bcrypt

# 1. Connect to your specific Database
MONGO_URI = "mongodb+srv://mohsin1:mohsin12@certi-fact-db.xnw07ls.mongodb.net/certifact?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["certifact"]
admins_collection = db["admins"]

# Initialize Bcrypt for password hashing
bcrypt = Bcrypt()

# 2. Admin Credentials
email = "admin@fyp.com"
password = "admin"

# 3. Logic: Check if exists, then create
if not admins_collection.find_one({"email": email}):
    # Hash the password
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Create the document
    admin_data = {
        "name": "Super Admin",
        "email": email,
        "password": hashed_pw,
        "role": "admin"
    }
    
    admins_collection.insert_one(admin_data)
    print(f"✅ SUCCESS: Admin created!")
    print(f"📧 Email: {email}")
    print(f"🔑 Password: {password}")
else:
    print(f"⚠️ INFO: Admin user ({email}) already exists in the database.")