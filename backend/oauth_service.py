import os
import secrets
from pathlib import Path

# Local development only. Never enable this in production.
if os.getenv("ENVIRONMENT", "development").lower() == "development":
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from fastapi import HTTPException, Request
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

# ================= CONFIGURATION =================
BASE_DIR = Path(__file__).resolve().parent
CLIENT_FILE = Path(
    os.getenv("GOOGLE_CLIENT_FILE", str(BASE_DIR / "web_credentials.json"))
)
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://127.0.0.1:8000/auth/callback",
)

# ================= TEMPORARY STORAGE =================
# These dictionaries are suitable only for a single running process and
# short-lived demos. They are cleared when the service restarts and are not
# shared across multiple workers/instances. Use Redis/database storage for
# production deployments.
oauth_states: dict[str, str] = {}
oauth_code_verifiers: dict[str, str] = {}
user_credentials: dict[str, Credentials] = {}

# ================= OAUTH FLOW =================
def create_oauth_flow(state: str | None = None, code_verifier: str | None = None):
    if not CLIENT_FILE.exists():
        raise RuntimeError(f"OAuth credentials file not found: {CLIENT_FILE}")

    flow = Flow.from_client_secrets_file(
        str(CLIENT_FILE),
        scopes=SCOPES,
        state=state,
        code_verifier=code_verifier,
    )
    flow.redirect_uri = REDIRECT_URI
    return flow

# ================= START GOOGLE LOGIN =================
def start_google_login() -> tuple[str, str]:
    session_id = secrets.token_urlsafe(32)
    code_verifier = secrets.token_urlsafe(64)
    flow = create_oauth_flow(code_verifier=code_verifier)

    authorization_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="select_account",
    )

    # OAuth state is random and validated on callback; it maps back to the
    # session without depending on a cross-site browser cookie.
    oauth_states[state] = session_id
    oauth_code_verifiers[state] = code_verifier
    return authorization_url, session_id

# ================= COMPLETE GOOGLE LOGIN =================
def complete_google_login(request: Request) -> str:
    state = request.query_params.get("state")
    code = request.query_params.get("code")

    if not state or not code:
        raise HTTPException(status_code=400, detail="OAuth callback is missing state or code.")

    session_id = oauth_states.get(state)
    if not session_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state. Start login again.",
        )

    code_verifier = oauth_code_verifiers.get(state)
    if not code_verifier:
        raise HTTPException(
            status_code=400,
            detail="OAuth code verifier missing. Start login again.",
        )

    flow = create_oauth_flow(state=state, code_verifier=code_verifier)

    try:
        flow.fetch_token(code=code)
        credentials = flow.credentials
    except Exception as exc:
        print("Google OAuth token exchange error:", repr(exc))
        oauth_states.pop(state, None)
        oauth_code_verifiers.pop(state, None)
        raise HTTPException(
            status_code=400,
            detail="Google authorization failed. Check backend logs and OAuth redirect URI.",
        ) from exc

    user_credentials[session_id] = credentials
    oauth_states.pop(state, None)
    oauth_code_verifiers.pop(state, None)
    return session_id

# ================= GET USER GMAIL SERVICE =================
def get_user_gmail_service(session_id: str):
    credentials = user_credentials.get(session_id)
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Gmail is not connected. Connect your Google account first.",
        )

    if credentials.expired and credentials.refresh_token:
        try:
            credentials.refresh(GoogleRequest())
        except Exception as exc:
            user_credentials.pop(session_id, None)
            raise HTTPException(
                status_code=401,
                detail="Gmail authorization expired. Please reconnect.",
            ) from exc

    if not credentials.valid:
        raise HTTPException(
            status_code=401,
            detail="Gmail authorization is invalid. Please reconnect.",
        )

    return build("gmail", "v1", credentials=credentials, cache_discovery=False)

# ================= DISCONNECT GOOGLE ACCOUNT =================
def disconnect_google_account(session_id: str):
    user_credentials.pop(session_id, None)
    for state, stored_session in list(oauth_states.items()):
        if stored_session == session_id:
            oauth_states.pop(state, None)
            oauth_code_verifiers.pop(state, None)
