import os

import requests
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Allocai")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def send_email(to_email, subject, html_body):
    # Sent over SendGrid's HTTPS API rather than raw SMTP -- Render (and
    # most free-tier hosts) block outbound SMTP entirely, but never
    # block HTTPS.
    response = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": SENDGRID_FROM_EMAIL, "name": SMTP_FROM_NAME},
            "subject": subject,
            "content": [{"type": "text/html", "value": html_body}]
        },
        timeout=10
    )

    if response.status_code >= 400:
        raise RuntimeError(f"SendGrid API error {response.status_code}: {response.text}")


def send_invitation_email(to_email, company_name, role_name, invitation_token):
    accept_url = f"{FRONTEND_URL}/Features/accept-invite/{invitation_token}"
    display_role = role_name.replace("_", " ").title()

    html_body = f"""
        <h2>You've been invited to join {company_name}</h2>
        <p>You've been invited to join <strong>{company_name}</strong> on Allocai as a <strong>{display_role}</strong>.</p>
        <p><a href="{accept_url}">Accept your invitation</a></p>
        <p>This invitation expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
    """

    send_email(
        to_email=to_email,
        subject=f"You're invited to join {company_name} on Allocai",
        html_body=html_body
    )
