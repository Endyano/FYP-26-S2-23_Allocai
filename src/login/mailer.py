import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Allocai")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def send_email(to_email, subject, html_body):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{SMTP_FROM_NAME} <{SMTP_USERNAME}>"
    message["To"] = to_email
    message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SMTP_USERNAME, [to_email], message.as_string())


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
