import psycopg2
from psycopg2.extras import RealDictCursor


class CasualStaff:

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
                    email AS username,
                    role
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