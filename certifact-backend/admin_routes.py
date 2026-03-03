from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from extensions import bcrypt, db  # <--- CRITICAL: Import from shared extensions
from datetime import datetime
import datetime as dt
from bson.objectid import ObjectId

admin_bp = Blueprint('admin', __name__)

# Collections (Using shared DB connection)
admins_collection = db["admins"]
users_collection = db["users"]
results_collection = db["results"]
logs_collection = db["admin_logs"]

# Helper to serialize MongoDB ObjectId
def serialize_doc(doc):
    if not doc: return None
    doc['_id'] = str(doc['_id'])
    if 'created_at' in doc: doc['created_at'] = str(doc['created_at'])
    if 'timestamp' in doc: doc['timestamp'] = str(doc['timestamp'])
    # Handle ObjectId fields if they exist
    if 'user_id' in doc and isinstance(doc['user_id'], ObjectId):
        doc['user_id'] = str(doc['user_id'])
    if 'job_id' in doc and isinstance(doc['job_id'], ObjectId):
        doc['job_id'] = str(doc['job_id'])
    return doc

# --- HELPER: CHECK ADMIN ROLE ---
def is_admin():
    claims = get_jwt()
    return claims.get("role") == "admin"

# --- 1. ADMIN LOGIN ---
@admin_bp.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    print(f"👮 Admin Login Attempt: {email}")

    admin = admins_collection.find_one({"email": email})

    if not admin:
        print("❌ Admin not found in DB")
        return jsonify({"msg": "Invalid email or password"}), 401

    if bcrypt.check_password_hash(admin['password'], password):
        print("✅ Password verified!")
        
        # CRITICAL: Add role='admin' so is_admin() works later
        access_token = create_access_token(
            identity=str(admin['_id']), 
            additional_claims={"role": "admin"}
        )
        
        logs_collection.insert_one({
            "action": "Login",
            "details": f"Admin {email} logged in",
            "timestamp": dt.datetime.utcnow()
        })
        
        return jsonify(access_token=access_token, admin_name=admin['name']), 200
    
    print("❌ Invalid Password")
    return jsonify({"msg": "Invalid email or password"}), 401

# --- 2. DASHBOARD STATS ---
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    # Security Check
    if not is_admin(): 
        return jsonify({"msg": "Admins only!"}), 403

    try:
        stats = {
            "total_users": users_collection.count_documents({}),
            "total_uploads": results_collection.count_documents({}), 
            "total_admins": admins_collection.count_documents({})
        }
        return jsonify(stats), 200
    except Exception as e:
        print(f"🔥 Error fetching stats: {e}")
        return jsonify({"msg": "Internal Server Error"}), 500

# --- 3. USER MANAGEMENT ---
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if not is_admin(): return jsonify({"msg": "Admins only!"}), 403

    try:
        users = list(users_collection.find({}, {"password_hash": 0})) 
        return jsonify([serialize_doc(user) for user in users]), 200
    except Exception as e:
        print(f"🔥 Error in get_users: {e}")
        return jsonify({"msg": "Failed to fetch users"}), 500

@admin_bp.route('/add-user', methods=['POST'])
@jwt_required()
def add_user():
    if not is_admin(): return jsonify({"msg": "Admins only!"}), 403

    data = request.get_json()
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"msg": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = {
        "name": data['name'],
        "email": data['email'],
        "password_hash": hashed_pw,
        "created_at": dt.datetime.utcnow()
    }
    users_collection.insert_one(new_user)
    
    logs_collection.insert_one({
        "action": "Add User",
        "details": f"User {data['email']} added by admin",
        "timestamp": dt.datetime.utcnow()
    })
    return jsonify({"msg": "User added successfully"}), 201

@admin_bp.route('/delete-user/<id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    if not is_admin(): return jsonify({"msg": "Admins only!"}), 403

    try:
        users_collection.delete_one({"_id": ObjectId(id)})
        logs_collection.insert_one({
            "action": "Delete User",
            "details": f"User ID {id} deleted",
            "timestamp": dt.datetime.utcnow()
        })
        return jsonify({"msg": "User deleted"}), 200
    except Exception as e:
        return jsonify({"msg": "Error deleting user"}), 500

# --- 4. ADMIN MANAGEMENT ---
@admin_bp.route('/add-admin', methods=['POST'])
@jwt_required()
def add_admin():
    if not is_admin(): return jsonify({"msg": "Admins only!"}), 403

    data = request.get_json()
    if admins_collection.find_one({"email": data['email']}):
        return jsonify({"msg": "Admin email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_admin = {
        "name": data['name'],
        "email": data['email'],
        "password": hashed_pw,
        "role": "admin"
    }
    admins_collection.insert_one(new_admin)
    return jsonify({"msg": "Admin added successfully"}), 201

# --- 5. UPLOADS & DETECTIONS ---
@admin_bp.route('/uploads', methods=['GET'])
@jwt_required()
def get_uploads():
    if not is_admin(): return jsonify({"msg": "Admins only!"}), 403

    uploads = list(results_collection.find({}).sort("timestamp", -1))
    return jsonify([serialize_doc(up) for up in uploads]), 200

# --- 6. ACTIVITY LOGS ---
@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_logs():
    if not is_admin(): return jsonify({"msg": "Admins only!"}), 403

    logs = list(logs_collection.find({}).sort("timestamp", -1).limit(100))
    return jsonify([serialize_doc(log) for log in logs]), 200

# --- 7. CHANGE PASSWORD (NEW) ---
@admin_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    # Note: We don't enforce is_admin() here because the user is changing THEIR OWN password.
    # We trust get_jwt_identity() to give us the ID of the logged-in admin.
    current_admin_id = get_jwt_identity()
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({"msg": "Both current and new passwords are required"}), 400

    # Fetch admin from admins_collection
    admin = admins_collection.find_one({"_id": ObjectId(current_admin_id)})
    if not admin:
        return jsonify({"msg": "Admin not found"}), 404

    # Verify Current Password
    if not bcrypt.check_password_hash(admin['password'], current_password):
        return jsonify({"msg": "Incorrect current password"}), 401

    # Hash New Password
    new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

    # Update Database
    admins_collection.update_one(
        {"_id": ObjectId(current_admin_id)},
        {"$set": {"password": new_hashed_password}}
    )
    
    logs_collection.insert_one({
        "action": "Password Change",
        "details": f"Admin {admin['email']} changed their password",
        "timestamp": dt.datetime.utcnow()
    })

    return jsonify({"msg": "Password updated successfully"}), 200