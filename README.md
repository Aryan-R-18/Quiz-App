# 🧠 Quiz App

An interactive AI-powered **Quiz App** built using **FastAPI**, **Gemini API**, and **React + Vite**.  
Users can log in via **Google OAuth**, generate smart quiz questions using Gemini AI, and enjoy a seamless web experience.

---

## 🚀 Tech Stack

- ⚙️ **Backend:** FastAPI (Python)
- 🤖 **AI:** Gemini API (Google Generative AI)
- 🎨 **Frontend:** React + Vite
- 🔐 **Authentication:** Google OAuth 2.0

---

## 📦 Full Installation & Run Guide

This guide will help you set up both the **backend (FastAPI)** and **frontend (React + Vite)** in a few simple steps.

---

### 🧾 Prerequisites

Ensure you have the following installed:

- ✅ Python 3.10+
- ✅ Node.js v18+
- ✅ Git
- ✅ Google Cloud Project for OAuth
- ✅ Gemini API Key from [Google AI Studio](https://makersuite.google.com/app)

---

## 🛠️ Backend Setup (FastAPI + Gemini)

### ▶️ Step-by-Step Commands

```bash
# 1. Clone the repository
git clone https://github.com/your-username/quiz-app.git
cd quiz-app

# 2. Navigate to the backend folder
cd backend

# 3. Create a virtual environment
python -m venv venv

# 4. Activate the virtual environment

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# 5. Install Python dependencies
pip install -r requirements.txt

# 6. Create a .env file with your Gemini API Key
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# 7. Start the FastAPI server
uvicorn app.main:app --reload


# 1. Open a new terminal (keep backend running)
# 2. Navigate to the frontend folder
cd frontend

# 3. Install frontend dependencies
npm install

# 4. Create .env file with Google OAuth Client ID
echo VITE_GOOGLE_CLIENT_ID=your_google_client_id_here > .env

# 5. Start the frontend server
npm run dev
