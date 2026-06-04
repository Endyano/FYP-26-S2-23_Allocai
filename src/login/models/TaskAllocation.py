import psycopg2
from psycopg2.extras import RealDictCursor


class TaskAllocation:

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

    def get_all_allocations(self):
        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT *
                FROM public.task_allocations
                ORDER BY id DESC;
            """

            cursor.execute(query)
            return cursor.fetchall()

        except Exception as error:
            print(f"Get all allocations error: {error}")
            return []

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_allocations_by_staff(self, staff_id):
        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT *
                FROM public.task_allocations
                WHERE staff_id = %s
                ORDER BY id DESC;
            """

            cursor.execute(query, (staff_id,))
            return cursor.fetchall()

        except Exception as error:
            print(f"Get allocations by staff error: {error}")
            return []

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_allocations_by_department(self, department_id):
        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT *
                FROM public.task_allocations
                WHERE department_id = %s
                ORDER BY id DESC;
            """

            cursor.execute(query, (department_id,))
            return cursor.fetchall()

        except Exception as error:
            print(f"Get allocations by department error: {error}")
            return []

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()