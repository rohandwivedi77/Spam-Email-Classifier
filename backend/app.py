from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import pickle
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer

from gmail_service import get_emails


from fastapi import Request
from fastapi.responses import RedirectResponse, JSONResponse

from oauth_service import (
    start_google_login,
    complete_google_login,
    get_user_gmail_service,
    disconnect_google_account,
    user_credentials,
)

FRONTEND_URL = "http://127.0.0.1:5173"


# ----------------------------------------------------
# FastAPI Application
# ----------------------------------------------------

app = FastAPI(
    title="Spam Email Classifier API",
    description="Predict whether a message is Spam or Ham using Machine Learning.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://YOUR_PROJECT.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
# Text Preprocessing Function
# ----------------------------------------------------

def transform_text(text):

    # Convert to lowercase
    text = text.lower()

    # Tokenization
    text = word_tokenize(text)

    # Remove punctuation and special characters
    words = []

    for word in text:
        if word.isalnum():
            words.append(word)

    # Remove stopwords
    filtered_words = []

    for word in words:
        if word not in stop_words:
            filtered_words.append(word)

    # Stemming
    stemmed_words = []

    for word in filtered_words:
        stemmed_words.append(ps.stem(word))

    return " ".join(stemmed_words)

def classify_message(message):

    clean_message = transform_text(message)

    vector = vectorizer.transform([clean_message])

    prediction = model.predict(vector)[0]

    probability = model.predict_proba(vector).max()

    result = "Spam" if prediction == 1 else "Ham"

    return {
        "processed_message": clean_message,
        "prediction": result,
        "confidence": round(float(probability), 4)
    }

# ----------------------------------------------------
# Request Model
# ----------------------------------------------------

class Message(BaseModel):
    message: str

# ----------------------------------------------------
# Response Model
# ----------------------------------------------------

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
    return {
        "message": "Spam Detection API is Running"
    }

# ----------------------------------------------------
# Prediction Route
# ----------------------------------------------------

@app.post("/predict", response_model=PredictionResponse)
def predict(data: Message):

    # Check empty input
    if not data.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    # Result
    result = classify_message(data.message)

    return PredictionResponse(
        original_message=data.message,
        processed_message=result["processed_message"],
        prediction=result["prediction"],
        confidence=result["confidence"]
    )



@app.get("/gmail/emails")
def gmail_emails(
    request: Request,
    max_results: int = 5,
    page_token: str | None = None,
    query: str | None = None,
):
    session_id = request.cookies.get("verishield_session")

    # Debugging
    print("GMAIL COOKIE RECEIVED:", bool(session_id))
    print(
        "GMAIL SESSION EXISTS:",
        session_id in user_credentials if session_id else False
    )

    if not session_id:
        raise HTTPException(
            status_code=401,
            detail="Gmail session cookie missing. Please connect Google again."
        )

    # Get authenticated user's Gmail service
    service = get_user_gmail_service(session_id)

    # Fetch emails
    gmail_result = get_emails(
        max_results=max_results,
        page_token=page_token,
        query=query,
        service=service,
    )

    results = []

    for email in gmail_result["emails"]:
        text = (
            email.get("subject", "")
            + " "
            + email.get("body", "")
        )

        prediction_result = classify_message(text)

        results.append({
            "id": email["id"],
            "sender": email["sender"],
            "subject": email["subject"],
            "body": email["body"],
            "prediction": prediction_result["prediction"],
            "confidence": prediction_result["confidence"],
        })

    return {
        "count": len(results),
        "emails": results,
        "next_page_token": gmail_result["next_page_token"],
    }



@app.get("/auth/google")
def auth_google():
    authorization_url, session_id = start_google_login()

    response = RedirectResponse(
        url=authorization_url,
        status_code=302,
    )

    response.set_cookie(
        key="verishield_session",
        value=session_id,
        httponly=True,
        secure=False,  # Local HTTP development only
        samesite="lax",
        max_age=3600,
        path="/",
    )

    return response



@app.get("/auth/callback")
def auth_callback(request: Request):
    session_id = request.cookies.get("verishield_session")

    if not session_id:
        return JSONResponse(
            status_code=401,
            content={
                "detail": "OAuth session cookie missing. Start login again."
            },
        )

    try:
        complete_google_login(request, session_id)
    except Exception as exc:
        print("OAuth callback failed:", repr(exc))
        raise

    return RedirectResponse(
        url=f"{FRONTEND_URL}/?gmail_connected=true",
        status_code=302,
    )



@app.get("/auth/status")
def auth_status(request: Request):
    session_id = request.cookies.get("verishield_session")

    print("Status endpoint - cookie received:", bool(session_id))

    if not session_id:
        return {"connected": False, "reason": "session cookie missing"}

    print(
        "status endpoint - credentials found:",
        session_id in user_credentials
    )

    try:
        service = get_user_gmail_service(session_id)

        profile = service.users().getProfile(
            userId="me"
        ).execute()

        return {
            "connected": True,
            "email": profile.get("emailAddress"),
        }

    except Exception as exc:
        print("auth status error:",repr(exc))
        return {"connected": False}


@app.post("/auth/disconnect")
def auth_disconnect(request: Request):
    session_id = request.cookies.get("verishield_session")

    if session_id:
        disconnect_google_account(session_id)

    response = JSONResponse(
        content={"connected": False}
    )

    response.delete_cookie(
        key="verishield_session",
        path="/",
        samesite="lax",
    )

    return response
