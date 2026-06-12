import psycopg2
from psycopg2.extras import RealDictCursor
from models.db_config import SUPABASE_CONFIG


class CasualStaff:

    def __init__(self):
        self.connection_config = SUPABASE_CONFIG

    def get_connection(self):
        return psycopg2.connect(**self.connection_config)

    def get_all_staff(self):
        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT
                    id,
                    full_name,
                    email,
                    role,
                    is_suspended,
                    max_weekly_hours
                FROM public.profiles
                WHERE role = 'Casual Staff'
                ORDER BY full_name;
            """

            cursor.execute(query)
            return cursor.fetchall()

        except Exception as error:
            print(f"Get casual staff error: {error}")
            return []

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_staff_by_id(self, staff_id):
        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT 
                    id,
                    full_name,
                    email AS username,
                    role
                FROM public.profiles
                WHERE id = %s
                AND role = 'Casual Staff';
            """

            cursor.execute(query, (staff_id,))
            return cursor.fetchone()

        except Exception as error:
            print(f"Get casual staff by ID error: {error}")
            return None

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_profile(self, staff_id):
        return self.get_staff_by_id(staff_id)

    def update_profile(self, staff_id, full_name, username):
        connection = None
        cursor = None

        if not full_name or not username:
            return {
                "success": False,
                "message": "Full name and username/email are required."
            }

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            duplicate_query = """
                SELECT id
                FROM public.profiles
                WHERE email = %s
                AND id <> %s;
            """

            cursor.execute(duplicate_query, (username, staff_id))
            duplicate_user = cursor.fetchone()

            if duplicate_user:
                return {
                    "success": False,
                    "message": "Username/email is already used by another account."
                }

            update_query = """
                UPDATE public.profiles
                SET full_name = %s,
                    email = %s
                WHERE id = %s
                AND role = 'Casual Staff'
                RETURNING id, full_name, email AS username, role;
            """

            cursor.execute(update_query, (full_name, username, staff_id))
            updated_profile = cursor.fetchone()
            connection.commit()

            if updated_profile is None:
                return {
                    "success": False,
                    "message": "Casual employee profile was not found."
                }

            return {
                "success": True,
                "message": "Profile updated successfully.",
                "profile": dict(updated_profile)
            }

        except Exception as error:
            if connection:
                connection.rollback()

            print(f"Update casual staff profile error: {error}")

            return {
                "success": False,
                "message": "System failed to update the profile."
            }

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
