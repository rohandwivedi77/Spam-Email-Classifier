import os.path
import base64

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def get_gmail_service():

    creds = None

    # Check if token already exists
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file(
            "token.json",
            SCOPES
        )

    # If credentials don't exist or are invalid
    if not creds or not creds.valid:

        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())

        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json",
                SCOPES
            )

            creds = flow.run_local_server(port=0)

        # Save token for future use
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    # Create Gmail API service
    service = build(
        "gmail",
        "v1",
        credentials=creds,
        cache_discovery=False
    )    
    return service


def get_emails(max_results=5, page_token=None, query=None, service=None):
    # Use the authenticated user's Gmail service when provided.
    # Retain the old service as a fallback for existing local tests.
    if service is None:
        service = get_gmail_service()

    params = {
        "userId": "me",
        "maxResults": max_results,
    }

    if query and query.strip():
        params["q"] = query.strip()

    if page_token:
        params["pageToken"] = page_token

    results = service.users().messages().list(
        **params
    ).execute()

    messages = results.get("messages", [])
    emails = []

    for message in messages:
        msg = service.users().messages().get(
            userId="me",
            id=message["id"],
            format="full",
        ).execute()

        payload = msg.get("payload", {})
        headers = payload.get("headers", [])

        subject = ""
        sender = ""

        for header in headers:
            name = header.get("name", "").lower()

            if name == "subject":
                subject = header.get("value", "")
            elif name == "from":
                sender = header.get("value", "")

        body = get_email_body(payload)

        emails.append({
            "id": message["id"],
            "sender": sender,
            "subject": subject,
            "body": body,
        })

    return {
        "emails": emails,
        "next_page_token": results.get("nextPageToken"),
    }



def get_email_body(payload):

    # Direct body
    if payload.get("body", {}).get("data"):
        data = payload["body"]["data"]

        return base64.urlsafe_b64decode(
            data
        ).decode(
            "utf-8",
            errors="ignore"
        )

    plain_text = ""
    html_text = ""

    for part in payload.get("parts", []):

        mime_type = part.get("mimeType", "")

        # Plain text
        if mime_type == "text/plain":

            data = part.get("body", {}).get("data")

            if data:
                plain_text = base64.urlsafe_b64decode(
                    data
                ).decode(
                    "utf-8",
                    errors="ignore"
                )

        # HTML
        elif mime_type == "text/html":

            data = part.get("body", {}).get("data")

            if data:
                html_text = base64.urlsafe_b64decode(
                    data
                ).decode(
                    "utf-8",
                    errors="ignore"
                )

        # Nested multipart
        elif part.get("parts"):

            nested_body = get_email_body(part)

            if nested_body:
                return nested_body

    # Prefer plain text for ML classification
    if plain_text:
        return plain_text

    # Fallback to HTML
    if html_text:
        return html_text

    return ""

