
# VeriShield AI — Spam Email Classifier

An AI-powered spam detection application that connects to Gmail,
fetches emails with read-only access, and classifies messages as
Spam or Ham using machine learning.

## Features

- Gmail OAuth authorization
- Gmail email retrieval
- Spam and Ham classification
- TF-IDF text vectorization
- Extra Trees classification model
- Email search and pagination
- AI confidence and trust score display
- React frontend and FastAPI backend

## Technology Stack

- Python
- FastAPI
- scikit-learn
- NLTK
- React
- Vite
- Axios
- Gmail API and Google OAuth 2.0

## Project Structure

- `backend/` — API, Gmail integration and ML model
- `frontend/` — React user interface
- `backend/model.pkl` — trained classifier
- `backend/vectorizer.pkl` — trained TF-IDF vectorizer

## Local Setup

### Backend

1. Open a terminal in `backend/`.
2. Create and activate a Python virtual environment.
3. Install dependencies:

   `pip install -r requirements.txt`

4. Configure Google OAuth credentials locally.
5. Start the API:

   `python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000`

### Frontend

1. Open another terminal in `frontend/`.
2. Install dependencies:

   `npm install`

3. Start the development server:

   `npm run dev -- --host 127.0.0.1`

## Model Evaluation

The selected Extra Trees model achieved approximately 98.07%
accuracy on the evaluated SMS Spam Collection test split.

This is a result on the SMS dataset and does not establish
the same accuracy on real-world Gmail emails.

## Security

- Never commit OAuth credentials, access tokens or `.env` files.
- Gmail integration is intended to use read-only access.
- Configure production OAuth redirect URIs and allowed origins
  before deploying.

## Limitations

- Model performance on real Gmail messages may differ from
  performance on the training and evaluation dataset.
- Production OAuth configuration and secure session storage
  are required before public deployment.
