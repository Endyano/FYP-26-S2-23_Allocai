import psycopg2
from psycopg2.extras import RealDictCursor


class TaskAllocation:

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
            print(f"Get all task allocations error: {error}")
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
                ORDER BY task_date ASC, start_time ASC;
            """

            cursor.execute(query, (staff_id,))
            return cursor.fetchall()

        except Exception as error:
            print(f"Get staff task allocations error: {error}")
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
            print(f"Get department task allocations error: {error}")
            return []

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def create_task(self, department_id, task_data):
        connection = None
        cursor = None

        task_name = task_data.get("task_name")
        description = task_data.get("description")
        staff_id = task_data.get("staff_id")
        task_date = task_data.get("task_date")
        start_time = task_data.get("start_time")
        end_time = task_data.get("end_time")
        priority = task_data.get("priority", "Medium")
        status = task_data.get("status", "Pending")

        if not task_name or not task_date or not start_time or not end_time:
            return {
                "success": False,
                "message": "Task name, date, start time, and end time are required."
            }

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                INSERT INTO public.task_allocations (
                    department_id,
                    staff_id,
                    task_name,
                    description,
                    task_date,
                    start_time,
                    end_time,
                    priority,
                    status
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *;
            """

            cursor.execute(
                query,
                (
                    department_id,
                    staff_id,
                    task_name,
                    description,
                    task_date,
                    start_time,
                    end_time,
                    priority,
                    status
                )
            )

            new_task = cursor.fetchone()
            connection.commit()

            return {
                "success": True,
                "message": "Task request created successfully.",
                "task": dict(new_task)
            }

        except Exception as error:
            if connection:
                connection.rollback()

            print(f"Create task allocation error: {error}")

            return {
                "success": False,
                "message": "System failed to create the task request."
            }

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_upcoming_schedule_by_staff(self, staff_id):
        connection = None
        cursor = None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT *
                FROM public.task_allocations
                WHERE staff_id = %s
                AND task_date >= CURRENT_DATE
                ORDER BY task_date ASC, start_time ASC;
            """

            cursor.execute(query, (staff_id,))
            schedule = cursor.fetchall()

            return {
                "success": True,
                "message": "Schedule retrieved successfully.",
                "schedule": schedule
            }

        except Exception as error:
            print(f"Get upcoming schedule error: {error}")

            return {
                "success": False,
                "message": "System failed to retrieve the schedule.",
                "schedule": []
            }

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
