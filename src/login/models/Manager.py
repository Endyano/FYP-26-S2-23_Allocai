import re
from uuid import uuid4

import psycopg2
from psycopg2.extras import Json, RealDictCursor


class Manager:

    EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def __init__(self):
        self.connection_config = {
            "dbname": "postgres",
            "user": "postgres.wmuqbyzzagrdpflhstay",
            "password": "fypsql26s223",
            "host": "aws-1-ap-southeast-2.pooler.supabase.com",
            "port": "6543"
        }

    def get_connection(self):
        return psycopg2.connect(**self.connection_config)

    def create_staff(self, full_name, email, password):
        full_name = (full_name or "").strip()
        email = (email or "").strip().lower()
        password = password or ""

        validation_error = self.validate_staff_input(full_name, email, password)

        if validation_error:
            return validation_error

        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            if self.email_exists(cursor, email):
                return {
                    "success": False,
                    "message": "Email is already used by another account."
                }

            staff_id = str(uuid4())

            self.create_auth_user(cursor, staff_id, email, password)
            created_profile = self.create_staff_profile(cursor, staff_id, full_name, email)

            connection.commit()

            return {
                "success": True,
                "message": "Casual staff profile created successfully.",
                "profile": dict(created_profile)
            }

        except Exception as error:
            if connection:
                connection.rollback()

            print(f"Manager create casual staff error: {error}")

            return {
                "success": False,
                "message": "System failed to create the casual staff profile."
            }

        finally:
            if cursor:
                cursor.close()

            if connection:
                connection.close()

    def validate_staff_input(self, full_name, email, password):
        if not full_name or not email or not password:
            return {
                "success": False,
                "message": "Full name, email, and password are required."
            }

        if not self.EMAIL_PATTERN.match(email):
            return {
                "success": False,
                "message": "Please enter a valid email address."
            }

        if len(password) < 6:
            return {
                "success": False,
                "message": "Password must be at least 6 characters long."
            }

        return None

    def email_exists(self, cursor, email):
        query = """
            SELECT id
            FROM public.profiles
            WHERE LOWER(email) = %s;
        """

        cursor.execute(query, (email,))
        return cursor.fetchone() is not None

    def create_auth_user(self, cursor, staff_id, email, password):
        query = """
            INSERT INTO auth.users (
                id,
                aud,
                role,
                email,
                encrypted_password,
                raw_app_meta_data,
                raw_user_meta_data,
                email_confirmed_at,
                created_at,
                updated_at
            )
            VALUES (
                %s,
                'authenticated',
                'authenticated',
                %s,
                %s,
                %s,
                %s,
                NOW(),
                NOW(),
                NOW()
            );
        """

        cursor.execute(
            query,
            (
                staff_id,
                email,
                password,
                Json({"provider": "email", "providers": ["email"]}),
                Json({"password": password})
            )
        )

    def create_staff_profile(self, cursor, staff_id, full_name, email):
        query = """
            INSERT INTO public.profiles (
                id,
                full_name,
                email,
                role
            )
            VALUES (%s, %s, %s, 'Casual Staff')
            RETURNING id, full_name, email, role;
        """

        cursor.execute(query, (staff_id, full_name, email))
        return cursor.fetchone()