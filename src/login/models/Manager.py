import re
from uuid import uuid4

import psycopg2
from psycopg2.extras import Json, RealDictCursor


class Manager:

    EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def __init__(self):
        self.connection_config = {
            "dbname": "task_allocation_db",
            "user": "postgres",
            "password": "fypsql",
            "host": "localhost",
            "port": "5432"
        }

    def get_connection(self):
        return psycopg2.connect(**self.connection_config)

    def create_staff(self, full_name, email, password):
        connection = None
        cursor = None

        full_name = (full_name or "").strip()
        email = (email or "").strip().lower()
        password = password or ""

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

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            duplicate_query = """
                SELECT id
                FROM public.profiles
                WHERE LOWER(email) = %s;
            """

            cursor.execute(duplicate_query, (email,))
            duplicate_user = cursor.fetchone()

            if duplicate_user:
                return {
                    "success": False,
                    "message": "Email is already used by another account."
                }

            staff_id = str(uuid4())

            auth_query = """
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
                auth_query,
                (
                    staff_id,
                    email,
                    password,
                    Json({"provider": "email", "providers": ["email"]}),
                    Json({"password": password})
                )
            )

            profile_query = """
                INSERT INTO public.profiles (
                    id,
                    full_name,
                    email,
                    role
                )
                VALUES (%s, %s, %s, 'Casual Staff')
                RETURNING id, full_name, email, role;
            """

            cursor.execute(profile_query, (staff_id, full_name, email))
            created_profile = cursor.fetchone()
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
