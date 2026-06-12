import psycopg2
from psycopg2.extras import RealDictCursor
from models.db_config import SUPABASE_CONFIG


class Department:

    def __init__(self):
        self.connection_config = SUPABASE_CONFIG

    def get_connection(self):
        return psycopg2.connect(**self.connection_config)

    def get_all_departments(self):
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
                WHERE role = 'Dept Staff'
                ORDER BY full_name;
            """

            cursor.execute(query)
            return cursor.fetchall()

        except Exception as error:
            print(f"Get departments error: {error}")
            return []

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_department_by_id(self, department_id):
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
                AND role = 'Dept Staff';
            """

            cursor.execute(query, (department_id,))
            return cursor.fetchone()

        except Exception as error:
            print(f"Get department by ID error: {error}")
            return None

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_department_by_user_id(self, user_id):
        return self.get_department_by_id(user_id)
