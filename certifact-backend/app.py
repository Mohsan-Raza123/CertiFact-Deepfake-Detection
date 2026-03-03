import os
# Suppress TensorFlow informational messages (only show errors)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# ================== 1. IMPORTS ==================
# Standard Library Imports
import uuid
import datetime
import threading
import time
from datetime import timedelta
import gc # Garbage collection for memory management
import requests

# Machine Learning & Data Processing (PyTorch & Transformers)
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import numpy as np

# Document Processing & OCR
import PyPDF2
import docx
import pytesseract
from PIL import Image
from pdf2image import convert_from_path # Critical for converting PDF pages to images for OCR

# Computer Vision (OpenCV & TensorFlow)
import cv2 
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image
from tensorflow.keras import backend as K
from mtcnn import MTCNN # Face detection library

# Web Framework & Database
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from bson import ObjectId


import re
import mimetypes
from flask import Response, request, send_from_directory


# Internal Project Modules
#from gradcam import generate_heatmap          # Custom function for XAI (Explainable AI)
from extensions import bcrypt, jwt, db, client # Flask extensions
from fpdf import FPDF 
from report_generator import generate_analysis_report 
from admin_routes import admin_bp 
from analytics import calculate_perplexity_burstiness # Statistical text analysis

# ================== 2. APP CONFIGURATION ==================
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing) to allow frontend at port 5173 to talk to this backend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Limit upload size to 50MB to prevent server overload
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 

# --- EXTERNAL TOOLS CONFIGURATION ---
# IMPORTANT: These paths must point to where Tesseract and Poppler are installed on your server/PC
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
POPPLER_PATH = r"C:\Program Files\poppler-24.02.0\Library\bin" 

# Initialize Flask Extensions
bcrypt.init_app(app)
jwt.init_app(app)
app.register_blueprint(admin_bp, url_prefix='/admin')

# Define folder for temporary storage of uploaded files
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Secret key for JWT Token generation (Keep this safe in production!)
app.config["JWT_SECRET_KEY"] = "80d0d67d6c98cdab56631b7a352a3ce9073a2e68e5150c9db52791e750fd265c"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

# ================== 3. DATABASE SETUP ==================
# Initialize Firebase Admin SDK (Used for Google Sign-In verification)
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    print("✅ Firebase Admin SDK initialized.")
except Exception as e: 
    print(f"🔥 Firebase Error: {e}")

# MongoDB Collections References
jobs_collection = db["jobs"]       # Stores background processing job status
results_collection = db["results"] # Stores final analysis results
users_collection = db["users"]     # Stores user profiles
admins_collection = db["admins"]   # Stores admin profiles
admin_logs_collection = db["admin_logs"]

# ================== 4. MODEL CONFIGURATION ==================
MODEL_DIR = 'model'
os.makedirs(MODEL_DIR, exist_ok=True)

# Define Model Paths and Download URLs
# 1. Image Model (Xception Network)
IMAGE_MODEL_PATH = os.path.join(MODEL_DIR, 'best_finetuned_xception.h5')
IMAGE_MODEL_URL = 'https://huggingface.co/moazashraf-ma/certifact-models/resolve/main/best_finetuned_xception.h5'

# 2. Video Base Model (CNN Feature Extractor)
BASE_MODEL_PATH = os.path.join(MODEL_DIR, 'deepfake_detector_v6_final_stable.h5')
BASE_MODEL_URL = 'https://huggingface.co/moazashraf-ma/certifact-models/resolve/main/deepfake_detector_v6_final_stable.h5'

# 3. Video LSTM Model (Temporal Sequence Analyzer)
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, 'deepfake_lstm_final.h5')

# Constants for Video Processing
IMG_SIZE = 224
SEQ_LENGTH = 10 # Number of frames to analyze in a sequence

# --- CUSTOM KERAS LAYER ---
# This class is required to load models that use specific casting operations
@tf.keras.utils.register_keras_serializable()
class Cast(keras.layers.Layer):
    def __init__(self, target_type='float32', **kwargs):
        super().__init__(**kwargs)
        self.target_type = target_type
    def call(self, inputs):
        return tf.cast(inputs, self.target_type)
    def get_config(self):
        config = super().get_config()
        config.update({"target_type": self.target_type})
        return config

def download_model(url, path, name):
    """Downloads model weights from HuggingFace if they don't exist locally."""
    if not os.path.exists(path):
        try:
            print(f"⬇️ Downloading {name} model...")
            response = requests.get(url)
            response.raise_for_status()
            with open(path, 'wb') as f: f.write(response.content)
            print(f"✅ {name} model downloaded!")
        except Exception as e: 
            print(f"🔥 Error downloading {name} model: {e}")

# Trigger downloads on startup
download_model(IMAGE_MODEL_URL, IMAGE_MODEL_PATH, "Image Xception")
download_model(BASE_MODEL_URL, BASE_MODEL_PATH, "Video Base CNN")

# Global Variables for Models (Lazy Loading approach)
image_model = None
video_pipeline = None 
mtcnn_detector = None
text_classifier = None
TEXT_MODEL_ID = "moazashraf-ma/ai-text-detector-v1"

# Locks to prevent thread conflicts during model inference
image_model_lock = threading.Lock()
video_model_lock = threading.Lock()

# ================== 5. MODEL LOADING LOGIC ==================

def load_text_model_lazy():
    """Loads the HuggingFace text detection model only when needed (saves RAM)."""
    global text_classifier
    if text_classifier is not None: return
    print(f"🔄 Lazy Loading Text Model: {TEXT_MODEL_ID}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(TEXT_MODEL_ID)
        model = AutoModelForSequenceClassification.from_pretrained(TEXT_MODEL_ID)
        text_classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, top_k=1, device=-1)
        print("✅ Text Model Loaded!")
    except Exception as e:
        print(f"🔥 Error loading Text Model: {e}")

def build_video_pipeline():
    """
    Constructs the Video Deepfake Detection Model.
    It combines a CNN (feature extractor) with an LSTM (temporal analysis).
    """
    print("🏗️ Building Video Pipeline...")
    K.clear_session()
    
    if not os.path.exists(LSTM_MODEL_PATH):
        print(f"❌ Error: LSTM Model not found at {LSTM_MODEL_PATH}")
        return None

    # Attempt 1: Direct Load (Simpler, works if architecture matches exactly)
    try:
        print("🔄 Attempt 1: Loading full model directly...")
        with keras.utils.custom_object_scope({'Cast': Cast}):
            model = keras.models.load_model(LSTM_MODEL_PATH, compile=False)
        print("✅ Video Pipeline Loaded (Direct Method).")
        return model
    except Exception as e:
        print(f"⚠️ Direct load failed ({str(e)}). Switching to Rebuild Mode...")

    # Attempt 2: Manually Reconstruct Architecture (More robust)
    try:
        print("🔨 Attempt 2: Reconstructing Architecture...")
        
        # Load the base CNN
        base_model = keras.models.load_model(BASE_MODEL_PATH, compile=False)
        
        # Extract the specific feature extraction layer
        feature_extractor = None
        for layer in base_model.layers:
            if isinstance(layer, layers.TimeDistributed):
                feature_extractor = layer.layer
                break
        
        if feature_extractor is None: feature_extractor = base_model

        # Create a clean feature extractor model
        inner_input = feature_extractor.input
        inner_output = feature_extractor.layers[-2].output
        feature_extractor_clean = keras.Model(inputs=inner_input, outputs=inner_output)
        feature_extractor_clean.trainable = False

        # Rebuild the TimeDistributed + LSTM layers
        input_seq = layers.Input(shape=(SEQ_LENGTH, IMG_SIZE, IMG_SIZE, 3), name='input_1')
        x = layers.TimeDistributed(layers.Resizing(150, 150), name='time_distributed_resizing')(input_seq)
        x = layers.TimeDistributed(feature_extractor_clean, name='time_distributed')(x)

        if len(x.shape) == 5:
            x = layers.TimeDistributed(layers.GlobalAveragePooling2D(), name='time_distributed_pooling')(x)

        x = layers.LSTM(64, return_sequences=False, name='lstm')(x)
        x = layers.Dropout(0.5)(x)
        output = layers.Dense(1, activation='sigmoid', dtype='float32', name='dense_output')(x)

        # Finalize and load weights
        combined_model = keras.Model(inputs=input_seq, outputs=output)
        print("📥 Loading LSTM weights...")
        combined_model.load_weights(LSTM_MODEL_PATH, by_name=True)
        print("✅ Video Pipeline Built Successfully (Rebuild Method).")
        return combined_model

    except Exception as e:
        print(f"🔥 Error building video pipeline: {e}")
        return None
    
# ================== 6. HELPER FUNCTIONS ==================

def extract_text_from_file(file_path):
    """
    SMART TEXT EXTRACTION: 
    1. Tries fast programmatic extraction (PyPDF2) first.
    2. If text is empty or garbage, falls back to slow OCR (Tesseract/Poppler).
    Handles PDF, Images, DOCX, and TXT.
    """
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    try:
        # --- PDF HANDLING ---
        if ext == '.pdf':
            # Strategy A: Fast Extraction (Metadata text)
            try:
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted: text += extracted + "\n"
            except: pass

            # Strategy B: OCR Fallback (If PDF is scanned images)
            if len(text.strip()) < 50:
                print("⚠️ Fast extraction failed/empty. Falling back to OCR (Slow)...")
                try:
                    images = convert_from_path(file_path, poppler_path=POPPLER_PATH)
                    text = ""
                    for img in images:
                        text += pytesseract.image_to_string(img) + "\n"
                except Exception as e:
                    print(f"OCR Failed: {e}")

        # --- IMAGE HANDLING ---
        elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']:
            print(f"🔍 Performing OCR on image: {file_path}")
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)

        # --- DOCX HANDLING ---
        elif ext == '.docx':
            doc = docx.Document(file_path)
            for para in doc.paragraphs: text += para.text + "\n"
            
        # --- TXT HANDLING ---
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f: text = f.read()

        # Clean up text (fix broken lines common in OCR)
        text = text.replace('\n', ' ').replace('  ', ' ')

    except Exception as e:
        print(f"🔥 Extraction Error: {e}")
        return ""
    
    return text.strip()

def normalize_perplexity_score(perplexity):
    """
    Converts raw statistical perplexity to a 0-100% AI Probability score.
    Logic:
    - Low Perplexity (<20) = Predictable text = Likely AI (100% AI score).
    - High Perplexity (>100) = Random/Complex text = Likely Human (0% AI score).
    """
    if perplexity < 20: return 1.0
    if perplexity > 100: return 0.0
    return (100 - perplexity) / 80.0

# ================== 7. VIDEO PROCESSING LOGIC ==================

def crop_video_to_face(input_video_path, output_video_path, detector, target_size=(224, 224), padding_factor=0.2):
    """
    Detects faces in video frames and crops the video to focus ONLY on the face.
    This improves model accuracy by removing background noise.
    """
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened(): return False
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_video_path, fourcc, fps, target_size)
    
    last_known_face_region = None
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret: break
        face_region = None
        
        # Run Face Detection every 3 frames to speed up processing
        if frame_count % 3 == 0: 
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            faces = detector.detect_faces(rgb_frame)
            if faces:
                # Pick the largest face in the frame
                main_face = max(faces, key=lambda f: f['box'][2] * f['box'][3])
                x, y, w, h = main_face['box']
                # Add padding around the face
                px, py = int(w * padding_factor), int(h * padding_factor)
                x1, y1 = max(0, x - px), max(0, y - py)
                x2, y2 = min(frame.shape[1], x + w + px), min(frame.shape[0], y + h + py)
                face_region = frame[y1:y2, x1:x2]
                last_known_face_region = face_region
        else:
            face_region = last_known_face_region

        # Resize cropped face to model input size (224x224)
        processed_frame = np.zeros((target_size[1], target_size[0], 3), dtype=np.uint8)
        if face_region is not None and face_region.size > 0:
            processed_frame = cv2.resize(face_region, target_size, interpolation=cv2.INTER_AREA)
        out.write(processed_frame)
        frame_count += 1

    cap.release(); out.release()
    return True

# ================== 8. BACKGROUND WORKER (IMAGES/VIDEO) ==================
def process_media(job_id, file_path, media_type, user_id):
    """
    Runs in a background thread.
    1. Detects Faces using MTCNN.
    2. Validates Face Count (Must be exactly 1).
    3. Processes Image or Video.
    4. Saves results.
    """
    # Update Job Status
    jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$set": {"status": "processing"}})
    
    # GPU Setup
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try: 
            for gpu in gpus: tf.config.experimental.set_memory_growth(gpu, True)
        except: pass

    face_cropped_path = None
    is_deepfake, confidence = (False, 0.0)
    thumbnail_filename = None
    heatmap_url = None
    
    # Initialize MTCNN
    detector = MTCNN()

    try:
        # --- STEP A: MULTI-FACE & NO-FACE DETECTION CHECK ---
        print(f"🔍 Running Face Validation on {media_type}...")
        
        check_img = None
        
        if media_type == 'image':
            # Load image for checking
            check_img = cv2.imread(file_path)
            if check_img is None: raise Exception("Could not read image file.")
            check_img = cv2.cvtColor(check_img, cv2.COLOR_BGR2RGB)
            
        elif media_type == 'video':
            # Load first frame of video for checking
            cap = cv2.VideoCapture(file_path)
            ret, frame = cap.read()
            cap.release()
            if not ret: raise Exception("Could not read video file or video is empty.")
            check_img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Run MTCNN Detection
        faces = detector.detect_faces(check_img)
        face_count = len(faces)
        print(f"👤 Faces Detected: {face_count}")

        # 1. ERROR: No Face Detected
        if face_count == 0:
            raise Exception("Validation Failed: No face detected. Please upload media where the face is clearly visible.")

        # 2. ERROR: Multiple Faces Detected
        if face_count > 1:
            raise Exception(f"Validation Failed: {face_count} faces detected. Please upload media containing only ONE person.")
        
        # --- STEP B: THUMBNAIL GENERATION ---
        if media_type == 'image':
            thumbnail_filename = os.path.basename(file_path)
        elif media_type == 'video':
            # We already loaded the frame in check_img, just save it
            thumbnail_filename = f"{os.path.splitext(os.path.basename(file_path))[0]}.jpg"
            # Convert back to BGR for saving
            cv2.imwrite(os.path.join(UPLOAD_FOLDER, thumbnail_filename), cv2.cvtColor(check_img, cv2.COLOR_RGB2BGR))

        # --- STEP C: IMAGE ANALYSIS (Xception) ---
        if media_type == 'image':
            with image_model_lock:
                try:
                    # Load model only if check passed
                    image_model = load_model(IMAGE_MODEL_PATH, compile=False)
                    img = keras_image.load_img(file_path, target_size=(150, 150))
                    img_array = np.expand_dims(keras_image.img_to_array(img), axis=0) / 255.0
                    
                    pred = image_model.predict(img_array)[0][0]
                    is_deepfake = bool(pred > 0.5)
                    confidence = float(pred if is_deepfake else 1 - pred)
                finally:
                    if image_model: del image_model; K.clear_session(); gc.collect()
            
        # --- STEP D: VIDEO ANALYSIS (LSTM) ---
        elif media_type == 'video':
            with video_model_lock:
                try:
                    video_pipeline = build_video_pipeline()
                    if video_pipeline is None: raise Exception("Failed to load video models.")

                    # 1. Crop face 
                    base, ext = os.path.splitext(file_path)
                    face_cropped_path = f"{base}_face_cropped.mp4"
                    
                    # Pass the ALREADY INITIALIZED detector to crop function
                    crop_success = crop_video_to_face(file_path, face_cropped_path, detector, target_size=(224, 224))
                    if not crop_success: raise Exception("Face detection failed during cropping.")

                    # 2. Extract sequences
                    cap = cv2.VideoCapture(face_cropped_path)
                    all_sequences = []; current_sequence = []
                    while True:
                        ret, frame = cap.read()
                        if not ret: break
                        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        normalized = rgb_frame.astype('float32') / 255.0
                        current_sequence.append(normalized)
                        if len(current_sequence) == SEQ_LENGTH:
                            all_sequences.append(np.array(current_sequence))
                            current_sequence = []
                    cap.release()

                    # 3. Predict
                    if len(all_sequences) == 0:
                        is_deepfake = False; confidence = 0.5
                    else:
                        batch_input = np.array(all_sequences)
                        predictions = video_pipeline.predict(batch_input, batch_size=2, verbose=1)
                        avg_score = np.mean(predictions)
                        is_deepfake = bool(avg_score > 0.5)
                        confidence = float(avg_score if is_deepfake else 1 - avg_score)

                finally:
                    if video_pipeline: del video_pipeline
                    # Do not delete 'detector' here if you want to reuse it, 
                    # but since this is a thread, we can let GC handle it or delete explicitly.
                    del detector 
                    K.clear_session(); gc.collect()

        # --- STEP E: SAVE RESULT TO DB ---
        result_doc = {
            "job_id": ObjectId(job_id), 
            "user_id": ObjectId(user_id), 
            "type": media_type,
            "filename": os.path.basename(file_path),
            "thumbnail_url": f"/uploads/{thumbnail_filename}" if thumbnail_filename else None,
            "heatmap_url": heatmap_url,
            "is_deepfake": is_deepfake, 
            "confidence": confidence, 
            "label": "AI-generated" if is_deepfake else "Real",
            "confidence_percent": round(confidence * 100, 2), 
            "timestamp": datetime.datetime.now(datetime.UTC)
        }
        res = results_collection.insert_one(result_doc)
        
        jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$set": {"status": "done", "result_id": str(res.inserted_id)}})

    except Exception as e:
        print(f"🔥 Processing Error: {e}")
        # THIS SENDS THE ERROR MESSAGE TO THE FRONTEND
        jobs_collection.update_one({"_id": ObjectId(job_id)}, {"$set": {"status": "error", "error_message": str(e)}})
    finally:
        if face_cropped_path: 
            try: os.remove(face_cropped_path)
            except: pass

# ================== 9. API ROUTES ==================

@app.route('/')
def index(): return jsonify({"status": "Server Running"}), 200

# REPLACE YOUR EXISTING serve_uploaded_file FUNCTION WITH THIS
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    path = os.path.join(UPLOAD_FOLDER, filename)
    
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    file_size = os.path.getsize(path)
    
    # 1. Smart MIME Type Detection
    lower_filename = filename.lower()
    if lower_filename.endswith('.mp4'):
        mime_type = 'video/mp4'
    elif lower_filename.endswith('.webm'):
        mime_type = 'video/webm'
    else:
        mime_type, _ = mimetypes.guess_type(path)
        if mime_type is None: mime_type = 'application/octet-stream'

    range_header = request.headers.get('Range', None)

    # 2. If no range header, send the whole file (standard download)
    if not range_header:
        return send_from_directory(UPLOAD_FOLDER, filename)

    # 3. Parse Range Header
    # Browsers send "bytes=0-" or "bytes=0-1024"
    byte1, byte2 = 0, None
    m = re.search(r'(\d+)-(\d*)', range_header)
    g = m.groups()
    
    if g[0]: byte1 = int(g[0])
    if g[1]: byte2 = int(g[1])

    # 4. Define Chunk Size (Critical for streaming)
    # If the browser didn't ask for a specific end byte, we send 1MB chunks
    # This prevents loading a 50MB video into RAM all at once.
    CHUNK_SIZE = 1024 * 1024  # 1MB
    
    if byte2 is None:
        byte2 = byte1 + CHUNK_SIZE - 1
    
    # Ensure we don't read past the end of the file
    if byte2 >= file_size:
        byte2 = file_size - 1
    
    length = byte2 - byte1 + 1

    # 5. Read the specific chunk
    with open(path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    # 6. Construct Response
    rv = Response(data, 206, mimetype=mime_type, direct_passthrough=True)
    rv.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
    rv.headers.add('Accept-Ranges', 'bytes')
    
    # CRITICAL FIX: Explicitly tell browser how big THIS chunk is
    rv.headers.add('Content-Length', str(length)) 
    
    rv.headers.add('Access-Control-Allow-Origin', '*') 
    
    return rv

@app.route('/api/health', methods=['GET'])
def health_check(): return jsonify({"status": "ok"})

# --- DOCUMENT ANALYSIS ROUTE (HYBRID APPROACH) ---
@app.route('/api/analyze-document', methods=['POST'])
@jwt_required()
def analyze_document():
    """
    Analyzes documents for AI generation using a Hybrid Approach:
    1. Neural Model (HuggingFace Transformers).
    2. Statistical Analytics (Perplexity & Burstiness).
    Combines both scores for the final verdict.
    """
    load_text_model_lazy()
    current_user_id = get_jwt_identity()

    if 'docFile' not in request.files: return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['docFile']
    if file.filename == '': return jsonify({'error': 'No file selected'}), 400

    # Save file temporarily
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # 1. EXTRACT TEXT
    extracted_text = extract_text_from_file(file_path)
    os.remove(file_path) # Clean up file immediately after extraction

    if not extracted_text or len(extracted_text.strip()) < 50: 
        return jsonify({'error': 'Text too short or unreadable (min 50 chars).'}), 400
    
    # 2. ANALYSIS
    processed_text = extracted_text[:2000] # Analyze first 2000 chars
    
    # --- PART A: Neural Model Prediction ---
    model_ai_prob = 0.5
    model_label = "UNKNOWN"
    try:
        if text_classifier:
            res = text_classifier(processed_text)
            top = res[0][0] if isinstance(res[0], list) else res[0]
            model_label = top['label']
            raw_confidence = float(top['score'])
            
            # Convert label/score to simple "AI Probability" (0.0 to 1.0)
            if model_label.upper() in ["AI", "LABEL_1"]:
                model_ai_prob = raw_confidence
            else:
                model_ai_prob = 1.0 - raw_confidence

            # Emergency Clamp: If model is 99.9% sure, lower it slightly to let Math stats weigh in.
            if model_ai_prob > 0.99:
                model_ai_prob = 0.95

    except Exception as e:
        print(f"🔥 Model Error: {e}")
    
    # --- PART B: Statistical Calculation ---
    perp, burst = 0.0, 0.0
    math_ai_prob = 0.0
    try:
        perp, burst = calculate_perplexity_burstiness(processed_text)
        math_ai_prob = normalize_perplexity_score(perp)
    except Exception as e:
        print(f"🔥 Analytics Error: {e}")

    # --- PART C: Decision Logic ---
    print(f"🧠 Model: {model_ai_prob:.2f} | 📉 Math: {math_ai_prob:.2f}")

    final_score = 0.0
    reasoning = "Analysis complete."

    # SCENARIO 1: Model is Paranoid (High AI score) but Math says Human (High Complexity)
    if model_ai_prob > 0.90 and math_ai_prob < 0.15:
        print("⚠️ Conflict: Model is paranoid. Trusting Math significantly.")
        final_score = 0.55 # Lean slightly AI, but keep confidence low
        reasoning = "Neural model detected strong AI patterns, though statistical complexity is high."

    # SCENARIO 2: Math Veto (Statistical complexity is extreme -> Definite Human)
    # This protects distinct human writing styles (like Einstein papers)
    elif math_ai_prob < 0.10: 
        print("🛡️ VETO: Math says Definite Human.")
        final_score = math_ai_prob 
        reasoning = "Statistical markers confirm Human authorship (High Complexity)."

    # SCENARIO 3: Agreement (Both say AI)
    elif model_ai_prob > 0.8 and math_ai_prob > 0.6:
        final_score = 0.99 
        reasoning = "Both Neural and Statistical engines confirm AI generation."

    # SCENARIO 4: Standard Weighted Average
    else:
        final_score = (0.60 * model_ai_prob) + (0.40 * math_ai_prob)
        reasoning = "Standard weighted analysis based on combined metrics."

    # Final Verdict Logic (Threshold > 50%)
    is_ai = bool(final_score > 0.50) 
    verdict = "AI-generated" if is_ai else "Real"
    verdict_confidence = final_score if is_ai else (1.0 - final_score)

    # --- SAVE TO DB ---
    try:
        db_res = results_collection.insert_one({
            "user_id": ObjectId(current_user_id), 
            "type": "document", 
            "filename": file.filename,
            "is_deepfake": is_ai, 
            "confidence": float(verdict_confidence), 
            "confidence_percent": float(round(verdict_confidence * 100, 2)), 
            "label": verdict,
            "timestamp": datetime.datetime.now(datetime.UTC),
            "analytics": {
                "perplexity": float(round(perp, 2)), 
                "burstiness": float(round(burst, 2)), 
                "model_label": model_label, 
                "model_prob": float(round(model_ai_prob, 2)),
                "math_prob": float(round(math_ai_prob, 2)),   
                "reasoning": reasoning 
            },
            "text_snippet": extracted_text[:100] + "...",
            "text_content": extracted_text
        })
        result_id = str(db_res.inserted_id)
    except Exception as e:
        print(f"🔥 DB Error: {e}")
        return jsonify({"error": "Database Error"}), 500
    
    return jsonify({
        "resultId": result_id, 
        "is_ai_generated": is_ai, 
        "ai_score_percent": float(round(final_score*100, 2)), 
        "verdict": verdict,
        "reasoning": reasoning,
        "text_content": extracted_text
    }), 200

# --- AUTH ROUTES ---

@app.route('/api/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    user = users_collection.find_one({"_id": ObjectId(current_user_id)})
    if not user or not bcrypt.check_password_hash(user['password_hash'], data.get('current_password')): 
        return jsonify({"error": "Invalid current password"}), 401
    users_collection.update_one({"_id": ObjectId(current_user_id)}, {"$set": {"password_hash": bcrypt.generate_password_hash(data.get('new_password')).decode('utf-8')}})
    return jsonify({"message": "Password updated"}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if users_collection.find_one({"email": data.get('email')}): 
        return jsonify({"error": "Email exists"}), 409
    users_collection.insert_one({
        "name": data.get('name'), 
        "email": data.get('email'), 
        "password_hash": bcrypt.generate_password_hash(data.get('password')).decode('utf-8'), 
        "created_at": datetime.datetime.now(datetime.UTC)
    })
    return jsonify({"message": "Success"}), 201

@app.route('/api/auth/google-signin', methods=['POST'])
def google_signin():
    """Verifies Google ID Token via Firebase and logs user in."""
    try:
        decoded = auth.verify_id_token(request.get_json().get('token'))
        user = users_collection.find_one_and_update(
            {"email": decoded.get('email')}, 
            {"$setOnInsert": {"created_at": datetime.datetime.now(datetime.UTC)}, 
             "$set": {"name": decoded.get('name'), "firebase_uid": decoded['uid'], "profile_picture": decoded.get('picture')}}, 
            upsert=True, return_document=True
        )
        return jsonify(access_token=create_access_token(identity=str(user['_id']), additional_claims={"role": "user"}))
    except: return jsonify({"error": "Auth failed"}), 401

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    # Check Admin
    admin = admins_collection.find_one({"email": data.get('email')})
    if admin and bcrypt.check_password_hash(admin['password'], data.get('password')):
        return jsonify({
            "access_token": create_access_token(identity=str(admin['_id']), additional_claims={"role": "admin"}), 
            "role": "admin", 
            "username": admin.get('name')
        }), 200
    
    # Check User
    user = users_collection.find_one({"email": data.get('email')})
    if user and bcrypt.check_password_hash(user['password_hash'], data.get('password')):
        return jsonify({
            "access_token": create_access_token(identity=str(user['_id']), additional_claims={"role": "user"}), 
            "role": "user", 
            "username": user.get('name')
        }), 200
    return jsonify({"error": "Invalid credentials"}), 401

# --- MEDIA ROUTES ---

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """Handles file upload and triggers background processing thread."""
    uid = get_jwt_identity()
    file = request.files['mediaFile']
    unique = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_FOLDER, unique)
    file.save(path)
    
    # Create Job in DB
    job = jobs_collection.insert_one({
        "user_id": ObjectId(uid), "status": "queued", "created_at": datetime.datetime.now(datetime.UTC)
    })
    
    # Start Background Thread
    media_type = 'video' if 'video' in file.content_type else 'image'
    threading.Thread(target=process_media, args=(str(job.inserted_id), path, media_type, uid)).start()
    
    return jsonify({"jobId": str(job.inserted_id)}), 202

@app.route('/api/status/<string:job_id>', methods=['GET'])
@jwt_required()
def get_status(job_id):
    job = jobs_collection.find_one({"_id": ObjectId(job_id), "user_id": ObjectId(get_jwt_identity())})
    
    if not job:
        return jsonify({"error": "Not found"}), 404

    return jsonify({
        "status": job.get('status'), 
        "resultId": job.get('result_id'),
        # ADD THIS LINE BELOW:
        "error_message": job.get('error_message') 
    })

@app.route('/api/results/<string:result_id>', methods=['GET'])
@jwt_required()
def get_result(result_id):
    res = results_collection.find_one({"_id": ObjectId(result_id), "user_id": ObjectId(get_jwt_identity())})
    if res: 
        res['_id'] = str(res['_id'])
        res['job_id'] = str(res.get('job_id', ''))
        res['user_id'] = str(res['user_id'])
        
        # --- NEW CODE: Add file_url so the frontend video player can find it ---
        if 'filename' in res:
            res['file_url'] = f"/uploads/{res['filename']}"
        # -----------------------------------------------------------------------

    return jsonify(res) if res else (jsonify({"error": "Not found"}), 404)

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    hist = list(results_collection.find({"user_id": ObjectId(get_jwt_identity())}).sort("timestamp", -1))
    for h in hist: 
        h['_id'] = str(h['_id'])
        h['job_id'] = str(h.get('job_id', ''))
        h['user_id'] = str(h.get('user_id'))
    return jsonify(hist), 200

@app.route('/api/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Aggregates user stats for the dashboard chart."""
    uid = ObjectId(get_jwt_identity())
    user = users_collection.find_one({"_id": uid}, {"name": 1})
    counts = list(results_collection.aggregate([{"$match": {"user_id": uid}}, {"$group": {"_id": "$label", "count": {"$sum": 1}}}]))
    recent = list(results_collection.find({"user_id": uid}).sort("timestamp", -1).limit(5))
    for r in recent: 
        r['_id'] = str(r['_id'])
        r['job_id'] = str(r.get('job_id', ''))
        r['user_id'] = str(r.get('user_id'))
    
    return jsonify({
        "userName": user.get('name', 'User') if user else 'User', 
        "totalAnalyses": results_collection.count_documents({"user_id": uid}), 
        "deepfakeCount": sum(i['count'] for i in counts if i['_id'] != 'Real'), 
        "realCount": sum(i['count'] for i in counts if i['_id'] == 'Real'), 
        "recentAnalyses": recent
    })

@app.route('/api/results/<string:result_id>/report', methods=['GET'])
@jwt_required()
def download_report(result_id):
    """Generates PDF report for a result."""
    res = results_collection.find_one({"_id": ObjectId(result_id), "user_id": ObjectId(get_jwt_identity())})
    if not res: return jsonify({"error": "Report not found"}), 404
    return Response(
        generate_analysis_report(res), 
        mimetype="application/pdf", 
        headers={"Content-Disposition": f"attachment;filename=Report_{result_id}.pdf"}
    )

# ================== 10. RUN SERVER ==================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Starting CertiFact server on port {port}...")
    app.run(host="0.0.0.0", port=port)