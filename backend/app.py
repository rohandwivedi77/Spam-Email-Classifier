import os
import pickle
from pathlib import Path

import nltk
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

from gmail_service import get_emails
from oauth_service import (
    start_google_login,
    complete_google_login,
    get_user_gmail_service,
    disconnect_google_account,
)

# ----------------------------------------------------
# Configuration
# ----------------------------------------------------
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://127.0.0.1:5173",
).rstrip("/")

FRONTEND_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

# Download required NLTK data at startup if it is not already present.
# Render may download these during build/startup; for reliability, add them
# to the build process if startup downloads are slow.
for resource, package in [
    ("tokenizers/punkt", "punkt"),
    ("tokenizers/punkt_tab", "punkt_tab"),
    ("corpora/stopwords", "stopwords"),
]:
    try:
        nltk.data.find(resource)
    except LookupError:
        nltk.download(package, quiet=True)

# ----------------------------------------------------
# FastAPI Application and CORS
# ----------------------------------------------------
app = FastAPI(
    title="Spam Email Classifier API",
    description="Predict whether a message is Spam or Ham using Machine Learning.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,  # Authentication uses X-Session-ID, not cross-site cookies.
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Session-ID"],
)

# ----------------------------------------------------
# Load Model and Vectorizer
# ----------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "model.pkl", "rb") as file:
    model = pickle.load(file)

with open(BASE_DIR / "vectorizer.pkl", "rb") as file:
    vectorizer = pickle.load(file)

# ----------------------------------------------------
# NLP Setup
# ----------------------------------------------------
ps = PorterStemmer()
stop_words = set(stopwords.words("english"))

# ----------------------------------------------------
# Session Helper
# ----------------------------------------------------
def get_session_id(request: Request) -> str | None:
    # The deployed frontend stores the OAuth session in sessionStorage and
    # sends it explicitly. Cookie fallback is retained for local compatibility.
    return request.headers.get("X-Session-ID") or request.cookies.get("verishield_session")

# ----------------------------------------------------
# Text Preprocessing
# ----------------------------------------------------
def transform_text(text: str) -> str:
    text = text.lower()
    tokens = word_tokenize(text)
    words = [word for word in tokens if word.isalnum()]
    filtered_words = [word for word in words if word not in stop_words]
    stemmed_words = [ps.stem(word) for word in filtered_words]
    return " ".join(stemmed_words)

# ----------------------------------------------------
# Spam Classification
# ----------------------------------------------------
def classify_message(message: str) -> dict:
    clean_message = transform_text(message)
    vector = vectorizer.transform([clean_message])
    prediction = model.predict(vector)[0]
    probability = model.predict_proba(vector).max()
    return {
        "processed_message": clean_message,
        "prediction": "Spam" if prediction == 1 else "Ham",
        "confidence": round(float(probability), 4),
    }

# ----------------------------------------------------
# Request and Response Models
# ----------------------------------------------------
class Message(BaseModel):
    message: str


class PredictionResponse(BaseModel):
    original_message: str
    processed_message: str
    prediction: str
    confidence: float

# ----------------------------------------------------
# Home Route
# ----------------------------------------------------
@app.get("/")
def home():
    return {"message": "Spam Detection API is Running"}

# ----------------------------------------------------
# Prediction Route
# ----------------------------------------------------
@app.post("/predict", response_model=PredictionResponse)
def predict(data: Message):
    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    result = classify_message(data.message)
    return PredictionResponse(
        original_message=data.message,
        processed_message=result["processed_message"],
        prediction=result["prediction"],
        confidence=result["confidence"],
    )

# ----------------------------------------------------
# Gmail Emails Route
# ----------------------------------------------------
@app.get("/gmail/emails")
def gmail_emails(
    request: Request,
    max_results: int = 5,
    page_token: str | None = None,
    query: str | None = None,
):
    if not 1 <= max_results <= 100:
        raise HTTPException(status_code=400, detail="max_results must be between 1 and 100.")

    session_id = get_session_id(request)
    if not session_id:
        raise HTTPException(status_code=401, detail="Gmail session missing. Please connect Google again.")

    service = get_user_gmail_service(session_id)
    gmail_result = get_emails(
        max_results=max_results,
        page_token=page_token,
        query=query,
        service=service,
    )

    results = []
    for email in gmail_result["emails"]:
        text = f'{email.get("subject", "")} {email.get("body", "")}'
        prediction_result = classify_message(text)
        results.append({
            "id": email["id"],
            "sender": email.get("sender", ""),
            "subject": email.get("subject", ""),
            "body": email.get("body", ""),
            "prediction": prediction_result["prediction"],
            "confidence": prediction_result["confidence"],
        })

    return {
        "count": len(results),
        "emails": results,
        "next_page_token": gmail_result.get("next_page_token"),
    }

# ----------------------------------------------------
# Google OAuth Login
# ----------------------------------------------------
@app.get("/auth/google")
def auth_google():
    authorization_url, _session_id = start_google_login()
    # No cross-site cookie is required. The session ID is linked to the
    # unpredictable OAuth state server-side and returned only after success.
    return RedirectResponse(url=authorization_url, status_code=302)

# ----------------------------------------------------
# Google OAuth Callback
# ----------------------------------------------------
@app.get("/auth/callback")
def auth_callback(request: Request):
    # Resolve the initiating session through the validated OAuth state instead
    # of relying on a third-party cookie being sent back by the browser.
    session_id = complete_google_login(request)
    return RedirectResponse(
        url=f"{FRONTEND_URL}/?gmail_connected=true#session_id={session_id}",
        status_code=302,
    )

# ----------------------------------------------------
# Gmail Connection Status
# ----------------------------------------------------
@app.get("/auth/status")
def auth_status(request: Request):
    session_id = get_session_id(request)
    if not session_id:
        return {"connected": False}

    try:
        service = get_user_gmail_service(session_id)
        profile = service.users().getProfile(userId="me").execute()
        return {"connected": True, "email": profile.get("emailAddress")}
    except HTTPException as exc:
        if exc.status_code == 401:
            return {"connected": False}
        raise
    except Exception:
        return {"connected": False}

# ----------------------------------------------------
# Disconnect Gmail
# ----------------------------------------------------
@app.post("/auth/disconnect")
def auth_disconnect(request: Request):
    session_id = get_session_id(request)
    if session_id:
        disconnect_google_account(session_id)

    response = JSONResponse(content={"connected": False})
    response.delete_cookie(key="verishield_session", path="/")
    return response
