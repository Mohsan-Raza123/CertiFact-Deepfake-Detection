# CertiFact: Full-Stack Deepfake Detection System 🕵️‍♂️🔍

> **🥈 2nd Place Winner - Inter-Campus FYP Competition | COMSATS University Islamabad**

## 📌 Project Overview
CertiFact is a robust, full-stack deepfake detection system designed to combat digital misinformation. Built as a Final Year Project (FYP), this application allows users to upload media and uses deep learning models to accurately classify whether the content is authentic or AI-generated. 

## 🏗️ Tech Stack
* **Frontend:** React.js
* **Backend:** Django / Flask *(Update to the one you primarily used)*
* **Machine Learning:** TensorFlow / PyTorch, OpenCV
* **Database:** PostgreSQL / Firebase *(Update based on your setup)*

## ✨ Key Features
* **High-Accuracy Detection:** Utilizes a trained deep learning model to analyze facial artifacts and inconsistencies in uploaded media.
* **Full-Stack Architecture:** Seamless integration between a responsive React frontend and a powerful Python backend.
* **Secure Data Handling:** Configured with strict security measures for API keys and database credentials.
* **User-Friendly Interface:** Intuitive dashboard for uploading content and viewing analysis results.

## 🚀 How to Run Locally

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/Mohsan-Raza123/CertiFact-Deepfake-Detection.git
cd CertiFact-Deepfake-Detection
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd certifact-backend
python -m venv venv
# Activate virtual environment (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python manage.py runserver # Or standard Flask run command
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd certifact-frontend
npm install
npm start
\`\`\`

## 👨‍💻 Author
**Mohsan Raza**
* BS Computer Science Graduate
* [www.linkedin.com/in/mohsin-raza-cs]
