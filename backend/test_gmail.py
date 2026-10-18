from gmail_service import get_emails


emails = get_emails(5)

print("\nEmails found:", len(emails))

for email in emails:

    print("\n==============================")
    print("From:", email["sender"])
    print("Subject:", email["subject"])
    print("Body:")
    print(email["body"][:500])