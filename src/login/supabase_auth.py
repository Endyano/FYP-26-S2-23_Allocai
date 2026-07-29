import os

import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")


class SupabaseAuth:

    @staticmethod
    def _headers():
        return {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        }

    @staticmethod
    def sign_up(email, password, full_name=None, phone_number=None):
        response = requests.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers=SupabaseAuth._headers(),
            json={
                "email": email,
                "password": password,
                "data": {
                    "full_name": full_name,
                    "phone_number": phone_number
                }
            }
        )
        return response.status_code, response.json()

    @staticmethod
    def sign_in(email, password):
        response = requests.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers=SupabaseAuth._headers(),
            json={
                "email": email,
                "password": password
            }
        )
        return response.status_code, response.json()

    @staticmethod
    def verify_otp(email, token, otp_type="signup"):
        response = requests.post(
            f"{SUPABASE_URL}/auth/v1/verify",
            headers=SupabaseAuth._headers(),
            json={
                "type": otp_type,
                "email": email,
                "token": token
            }
        )
        return response.status_code, response.json()

    @staticmethod
    def resend_otp(email, otp_type="signup"):
        response = requests.post(
            f"{SUPABASE_URL}/auth/v1/resend",
            headers=SupabaseAuth._headers(),
            json={
                "type": otp_type,
                "email": email
            }
        )
        return response.status_code, response.json()
