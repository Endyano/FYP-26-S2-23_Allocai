import re
from uuid import uuid4

import psycopg2
from psycopg2.extras import Json, RealDictCursor
from models.db_config import SUPABASE_CONFIG


class Manager:

    EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def __init__(self):
        self.connection_config = SUPABASE_CONFIG

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

            # 1. Generate the definitive system UUID
            staff_id = str(uuid4())

            # 2. Write to auth.users. This instantly triggers 'handle_new_user_signup()' 
            # inside Supabase to safely generate the public.profiles row automatically.
            self.create_auth_user(cursor, staff_id, email, password, full_name)
            
            # 3. Cleanly UPDATE and retrieve the profile fields created by the trigger.
            # This prevents any double-insert collisions from stopping the transaction!
            created_profile = self.update_staff_profile(cursor, staff_id, full_name)

            # Commit the single transaction smoothly
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

    def update_staff_profile(self, cursor, staff_id, full_name):
        # Capture tracking requirements (allocated_hours, max_weekly_hours).
        query = """
            UPDATE public.profiles 
            SET 
                full_name = %s,
                role = 'Casual Staff',
                allocated_hours = 0,
                max_weekly_hours = 16
            WHERE id = %s
            RETURNING id, full_name, email, role, allocated_hours, max_weekly_hours;
        """
        cursor.execute(query, (full_name, staff_id))
        return cursor.fetchone()

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

    def create_auth_user(self, cursor, staff_id, email, password, full_name):
        query = """
            INSERT INTO auth.users (
                id, aud, role, email, encrypted_password,
                raw_app_meta_data, raw_user_meta_data,
                email_confirmed_at, created_at, updated_at
            )
            VALUES (%s, 'authenticated', 'authenticated', %s, %s, %s, %s, NOW(), NOW(), NOW());
        """
        # trigger function can extract and write the name properly.
        cursor.execute(
            query,
            (
                staff_id,
                email,
                password,
                Json({"provider": "email", "providers": ["email"]}),
                Json({
                    "password": password,
                    "email_verified": True,
                    "full_name": full_name
                })
            )
        )

    def update_staff(self, staff_id, full_name, email, max_weekly_hours):
        full_name = (full_name or "").strip()
        email = (email or "").strip().lower()

        if not full_name or not email:
            return {"success": False, "message": "Full name and email are required."}
        if not self.EMAIL_PATTERN.match(email):
            return {"success": False, "message": "Please enter a valid email address."}

        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            cursor.execute(
                "SELECT id FROM public.profiles WHERE LOWER(email) = %s AND id <> %s;",
                (email, staff_id)
            )
            if cursor.fetchone():
                return {"success": False, "message": "Email is already used by another account."}

            cursor.execute(
                """
                UPDATE public.profiles
                SET full_name = %s, email = %s, max_weekly_hours = %s
                WHERE id = %s AND role = 'Casual Staff'
                RETURNING id, full_name, email, role, is_suspended, max_weekly_hours;
                """,
                (full_name, email, max_weekly_hours or 16, staff_id)
            )
            updated = cursor.fetchone()
            connection.commit()

            if not updated:
                return {"success": False, "message": "Staff member not found."}

            return {"success": True, "message": "Staff updated successfully.", "profile": dict(updated)}

        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Manager update_staff error: {error}")
            return {"success": False, "message": "Failed to update staff."}

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def toggle_suspend(self, staff_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            cursor.execute(
                """
                UPDATE public.profiles
                SET is_suspended = NOT is_suspended
                WHERE id = %s AND role = 'Casual Staff'
                RETURNING id, is_suspended;
                """,
                (staff_id,)
            )
            updated = cursor.fetchone()
            connection.commit()

            if not updated:
                return {"success": False, "message": "Staff member not found."}

            return {"success": True, "is_suspended": updated["is_suspended"]}

        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Manager toggle_suspend error: {error}")
            return {"success": False, "message": "Failed to update suspension status."}

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def delete_staff(self, staff_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()

            cursor.execute(
                "DELETE FROM public.task_allocations WHERE staff_id = %s;",
                (staff_id,)
            )
            cursor.execute(
                "DELETE FROM auth.users WHERE id = %s;",
                (staff_id,)
            )
            connection.commit()

            return {"success": True, "message": "Staff member deleted successfully."}

        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Manager delete_staff error: {error}")
            return {"success": False, "message": "Failed to delete staff member."}

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_monthly_report(self, year, month):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            cursor.execute(
                """
                SELECT
                    p.id,
                    p.full_name,
                    p.max_weekly_hours,
                    COALESCE(
                        SUM(
                            EXTRACT(EPOCH FROM (ta.end_time - ta.start_time)) / 3600
                        ), 0
                    ) AS monthly_hours
                FROM public.profiles p
                LEFT JOIN public.task_allocations ta
                    ON ta.staff_id = p.id
                    AND EXTRACT(YEAR  FROM ta.task_date) = %s
                    AND EXTRACT(MONTH FROM ta.task_date) = %s
                    AND ta.status != 'Cancelled'
                WHERE p.role = 'Casual Staff'
                GROUP BY p.id, p.full_name, p.max_weekly_hours
                ORDER BY p.full_name;
                """,
                (year, month)
            )
            rows = cursor.fetchall()

            report = []
            for row in rows:
                monthly_limit = row['max_weekly_hours'] * 4
                monthly_hours = float(row['monthly_hours'])
                over_limit = monthly_hours > monthly_limit
                exceed_pct = round(((monthly_hours - monthly_limit) / monthly_limit) * 100) if over_limit else 0

                report.append({
                    'id': str(row['id']),
                    'full_name': row['full_name'],
                    'monthly_hours': round(monthly_hours, 1),
                    'monthly_limit': monthly_limit,
                    'over_limit': over_limit,
                    'exceed_pct': exceed_pct,
                })

            return {'success': True, 'report': report}

        except Exception as error:
            print(f"Manager get_monthly_report error: {error}")
            return {'success': False, 'message': 'Failed to retrieve report.'}

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_stats(self):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            cursor.execute("SELECT COUNT(*) AS total FROM public.profiles WHERE role = 'Casual Staff';")
            total_staff = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(*) AS total FROM public.task_allocations WHERE status = 'Pending';")
            pending_tasks = cursor.fetchone()['total']

            cursor.execute("SELECT COUNT(DISTINCT department_name) AS total FROM public.profiles WHERE role = 'Department Staff' AND department_name IS NOT NULL;")
            total_departments = cursor.fetchone()['total']

            return {
                "success": True,
                "total_staff": int(total_staff),
                "pending_tasks": int(pending_tasks),
                "total_departments": int(total_departments),
            }

        except Exception as error:
            print(f"Manager get_stats error: {error}")
            return {"success": False, "message": "Failed to retrieve stats."}

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()