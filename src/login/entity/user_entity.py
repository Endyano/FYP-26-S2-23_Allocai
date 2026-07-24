import uuid
from psycopg2.extras import Json, RealDictCursor
from db import Database


class UserEntity:

    @staticmethod
    def get_by_email(email):
        query = """
            SELECT *
            FROM users
            WHERE LOWER(email) = LOWER(%s);
        """
        return Database.fetch_one(query, (email,))

    @staticmethod
    def verify_login(email, password):
        query = """
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.phone_number,
                u.global_role,
                u.account_status
            FROM auth.users au
            JOIN users u ON au.id = u.user_id
            WHERE LOWER(u.email) = LOWER(%s)
            AND au.raw_user_meta_data->>'password' = %s;
        """
        return Database.fetch_one(query, (email, password))

    @staticmethod
    def create_registered_user(full_name, email, password, phone_number=None):
        user_id = str(uuid.uuid4())
        connection = None
        cursor = None

        try:
            connection = Database.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            cursor.execute(
                """
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
                """,
                (
                    user_id,
                    email,
                    password,
                    Json({"provider": "email", "providers": ["email"]}),
                    Json({"password": password})
                )
            )

            cursor.execute(
                """
                INSERT INTO users (
                    user_id,
                    full_name,
                    email,
                    phone_number,
                    global_role,
                    account_status,
                    created_at,
                    updated_at
                )
                VALUES (%s, %s, %s, %s, 'registered_user', 'Active', NOW(), NOW())
                RETURNING user_id, full_name, email, phone_number, global_role, account_status;
                """,
                (user_id, full_name, email, phone_number)
            )

            user = cursor.fetchone()
            connection.commit()
            return user

        except Exception:
            if connection:
                connection.rollback()
            raise

        finally:
            if cursor:
                cursor.close()

            if connection:
                connection.close()