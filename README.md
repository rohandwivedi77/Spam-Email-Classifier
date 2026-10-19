# VeriShield AI — Spam Email Classifier

An AI-powered web application that classifies text messages as **Spam** or **Ham** and can scan Gmail messages after the user connects a Google account. VeriShield AI combines a machine-learning text-classification pipeline with a React interface and a FastAPI backend.

<p align="center">
  <a href="https://spam-email-classifier-kappa.vercel.app/">Live Demo</a> ·
  <a href="https://spam-email-classifier-fekr.onrender.com/docs">API Documentation</a>
</p>

> **Evaluation note:** The reported model metrics are from the project's SMS test dataset. They should not be interpreted as verified performance on real-world Gmail messages. Spam detection is probabilistic and can produce false positives or false negatives.

## Features

- **Spam / Ham prediction:** Classify user-provided text through the web interface.
- **Gmail integration:** Connect a Google account through OAuth and request read-only access to Gmail.
- **Inbox scanning:** Fetch recent messages and classify their subject/body text.
- **Search and pagination:** Search Gmail messages and load additional results.
- **Confidence and trust score:** Display model confidence and a derived trust score for each classification.
- **Email analysis view:** Review the message text and its classification details.
- **Deployed architecture:** React frontend hosted on Vercel and FastAPI backend hosted on Render.

## Live Application

| Component | Link |
|---|---|
| Frontend | https://spam-email-classifier-kappa.vercel.app/ |
| Backend health/root | https://spam-email-classifier-fekr.onrender.com/ |
| FastAPI Swagger UI | https://spam-email-classifier-fekr.onrender.com/docs |

The backend is hosted on Render's web-service infrastructure; the first request after inactivity may take a little time while the service wakes up.

## Model and Evaluation

The classification pipeline uses text preprocessing, **TF-IDF** features, and a trained **Extra Trees** classifier. NLTK is used for tokenization, stop-word removal, and stemming in the API preprocessing pipeline.

Previously measured results on the SMS test split:

| Metric | Score |
|---|---:|
| Accuracy | 98.07% |
| Precision | 100.00% |
| Recall | 85.71% |
| F1-score | 92.31% |

These figures apply to the evaluated SMS dataset and test split only. They are not a guarantee of performance on arbitrary email content. Gmail messages are classified using their subject and body text; attachments, images, and other non-text signals are not analyzed by this pipeline.

## Technology Stack

**Machine learning and backend**
- Python
- pandas / scikit-learn
- NLTK
- FastAPI and Uvicorn
- Google Gmail API and Google OAuth 2.0

**Frontend**
- React
- Vite
- Axios
- Tailwind CSS (where configured in the frontend)

**Deployment**
- Vercel — frontend
- Render — backend

## Repository Structure

```text
Spam_Email_Classifier/
├── backend/
│   ├── app.py                 # FastAPI endpoints and prediction pipeline
│   ├── gmail_service.py       # Gmail message retrieval
│   ├── oauth_service.py       # Google OAuth flow and Gmail credentials
│   ├── model.pkl              # Trained classifier
│   ├── vectorizer.pkl         # Fitted text vectorizer
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React + Vite application
├── Data/                      # Dataset files used by the project
└── Notebooks/
    └── spam_detection.ipynb   # Model experimentation / analysis
```

Some files or folders may differ if the repository has been reorganized since this documentation was written.

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/rohandwivedi77/Spam-Email-Classifier.git
cd Spam-Email-Classifier
```

### 2. Configure the backend

Use Python 3.12 if possible, then install the backend requirements:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

**Windows (PowerShell)**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
source .venv/bin/activate
```

Install dependencies and start the API:

```bash
pip install -r requirements.txt
uvicorn app:app --reload
```

The API should be available at `http://127.0.0.1:8000` and its interactive documentation at `http://127.0.0.1:8000/docs`.

Ensure the trained artifacts (`model.pkl` and `vectorizer.pkl`) are present in `backend/`. The application downloads required NLTK resources at startup if configured to do so; an environment with restricted network access may need those resources installed in advance.

### 3. Configure Google OAuth (optional, for Gmail scanning)

Gmail integration requires a Google Cloud project and OAuth 2.0 web-client credentials with the Gmail API enabled. Configure the OAuth redirect URI to match the backend callback URL. For local development, the default callback is:

```text
http://127.0.0.1:8000/auth/callback
```

Place the credentials JSON file at the path expected by the backend, or configure the environment variables below. **Never commit OAuth client secrets, user tokens, or credential files to Git.** Use environment variables and the hosting provider's secret-file mechanism for deployed environments.

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_FILE` | Path to the Google OAuth client JSON file |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL registered in Google Cloud |
| `FRONTEND_URL` | Frontend base URL used after OAuth completes |
| `FRONTEND_ORIGINS` | Comma-separated frontend origins allowed by CORS |
| `ENVIRONMENT` | Set to `production` for deployed environments |

Gmail access is requested with the read-only Gmail scope. Google OAuth consent-screen settings may require adding test users while the app remains in testing mode.

### 4. Start the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). If your frontend API URL is configured through an environment variable, set it to the local backend URL; otherwise update the API base URL in the frontend configuration before running locally.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Basic backend status message |
| `POST` | `/predict` | Classify a supplied text message as Spam or Ham |
| `GET` | `/auth/google` | Start Google OAuth login |
| `GET` | `/auth/callback` | Complete OAuth authorization |
| `GET` | `/auth/status` | Check Gmail connection status |
| `POST` | `/auth/disconnect` | Disconnect the current Gmail session |
| `GET` | `/gmail/emails` | Retrieve and classify Gmail messages |

### Example prediction request

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"message":"Congratulations! You have won a prize. Click the link now."}'
```

The response includes the original message, processed text, predicted class, and confidence score.

## Security and Privacy

- Gmail integration requests read-only access; the application is designed to read messages, not send, modify, or delete them.
- Keep Google OAuth credentials and access tokens private. Never put secrets in frontend code or commit them to source control.
- Use HTTPS for deployed services and configure CORS with only the frontend origins you trust.
- The current session/credential storage implementation may use in-memory state. Such state can be lost on backend restarts and is not suitable for reliable multi-worker production use. A production deployment should use secure, persistent server-side session storage and an appropriate token-storage strategy.
- Avoid sharing sensitive email content in screenshots, logs, issue reports, or public demonstrations.

## Limitations and Future Improvements

- Validate the model on a larger, representative email dataset and report results from a separate, reproducible test set.
- Improve recall while monitoring false-positive rates, especially for legitimate messages classified as spam.
- Add automated tests for preprocessing, prediction, OAuth handling, and Gmail API error cases.
- Replace in-memory session storage with secure persistent storage before relying on the Gmail integration for production use.
- Consider handling HTML-only messages and evaluating multilingual content, while maintaining privacy and least-privilege access.

## Contributing

Issues and pull requests are welcome. For substantial changes, open an issue first to discuss the proposed update. Do not include personal email content, OAuth secrets, access tokens, or other credentials in issues or pull requests.

## Disclaimer

VeriShield AI is an educational machine-learning project and should be used as an assistive signal, not as the sole basis for security decisions. A message classified as Ham may still be malicious, and a message classified as Spam may be legitimate.
