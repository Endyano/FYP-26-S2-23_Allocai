import os

import requests
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Allocai")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def send_email(to_email, subject, html_body):
    # Sent over Resend's HTTPS API rather than raw SMTP -- many hosts
    # (Render included) block outbound SMTP ports entirely, but never
    # block HTTPS.
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "from": f"{SMTP_FROM_NAME} <{RESEND_FROM_EMAIL}>",
            "to": [to_email],
            "subject": subject,
            "html": html_body
        },
        timeout=10
    )

    if response.status_code >= 400:
        raise RuntimeError(f"Resend API error {response.status_code}: {response.text}")


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
