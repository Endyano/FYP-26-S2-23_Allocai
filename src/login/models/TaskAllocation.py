import psycopg2
from psycopg2.extras import RealDictCursor
from models.db_config import SUPABASE_CONFIG


class TaskAllocation:

    def __init__(self):
        self.connection_config = SUPABASE_CONFIG

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
                SELECT
                    ta.*,
                    p.full_name AS assigned_staff_name
                FROM public.task_allocations ta
                LEFT JOIN public.profiles p ON p.id = ta.staff_id
                WHERE ta.department_id = %s
                ORDER BY ta.id DESC;
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

    def assign_staff(self, task_id, staff_id, department_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            # Get task duration
            cursor.execute(
                "SELECT start_time, end_time FROM public.task_allocations WHERE id = %s AND department_id = %s;",
                (task_id, department_id)
            )
            task = cursor.fetchone()
            if not task:
                return {"success": False, "message": "Task not found."}

            start = task['start_time']
            end = task['end_time']
            start_mins = start.hour * 60 + start.minute
            end_mins = end.hour * 60 + end.minute
            diff_mins = end_mins - start_mins
            if diff_mins < 0:
                diff_mins += 24 * 60
            task_hours = diff_mins / 60

            # Get staff's current allocated hours and weekly limit
            cursor.execute(
                """
                SELECT p.full_name, p.max_weekly_hours,
                       COALESCE(SUM(
                           CASE WHEN ta.status IN ('Approved', 'Cancellation Requested')
                                OR (ta.status = 'Completed'
                                    AND ta.task_date >= date_trunc('week', CURRENT_DATE)
                                    AND ta.task_date <= date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')
                           THEN
                               CASE WHEN ta.end_time < ta.start_time THEN
                                   EXTRACT(EPOCH FROM (ta.end_time - ta.start_time + INTERVAL '24 hours')) / 3600
                               ELSE
                                   EXTRACT(EPOCH FROM (ta.end_time - ta.start_time)) / 3600
                               END
                           ELSE 0 END
                       ), 0) AS allocated_hours
                FROM public.profiles p
                LEFT JOIN public.task_allocations ta ON ta.staff_id = p.id
                WHERE p.id = %s
                GROUP BY p.full_name, p.max_weekly_hours;
                """,
                (staff_id,)
            )
            staff = cursor.fetchone()
            if not staff:
                return {"success": False, "message": "Staff member not found."}

            if float(staff['allocated_hours']) + task_hours > float(staff['max_weekly_hours']):
                remaining = float(staff['max_weekly_hours']) - float(staff['allocated_hours'])
                return {
                    "success": False,
                    "message": f"Cannot assign: {staff['full_name']} only has {remaining:.1f}h remaining this week (limit: {staff['max_weekly_hours']}h). This task requires {task_hours:.1f}h."
                }

            cursor.execute(
                """
                UPDATE public.task_allocations
                SET staff_id = %s, status = 'Approved'
                WHERE id = %s AND department_id = %s
                RETURNING id, staff_id, task_name, status;
                """,
                (staff_id, task_id, department_id)
            )
            updated = cursor.fetchone()
            connection.commit()
            if not updated:
                return {"success": False, "message": "Task not found."}
            return {"success": True, "task": dict(updated)}
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Assign staff error: {error}")
            return {"success": False, "message": "Failed to assign staff."}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def cancel_task(self, task_id, department_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """
                UPDATE public.task_allocations
                SET status = 'Cancelled'
                WHERE id = %s AND department_id = %s
                RETURNING id, status;
                """,
                (task_id, department_id)
            )
            updated = cursor.fetchone()
            connection.commit()
            if not updated:
                return {"success": False, "message": "Task not found."}
            return {"success": True, "task": dict(updated)}
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Cancel task error: {error}")
            return {"success": False, "message": "Failed to cancel task."}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def delete_task(self, task_id, department_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor()
            cursor.execute(
                "DELETE FROM public.task_allocations WHERE id = %s AND department_id = %s;",
                (task_id, department_id)
            )
            connection.commit()
            return {"success": True, "message": "Task deleted."}
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Delete task error: {error}")
            return {"success": False, "message": "Failed to delete task."}
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
        staff_id = task_data.get("staff_id") or None
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

    def get_all_tasks_by_staff(self, staff_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """
                SELECT
                    ta.*,
                    p.full_name AS department_name_label
                FROM public.task_allocations ta
                LEFT JOIN public.profiles p ON p.id = ta.department_id
                WHERE ta.staff_id = %s
                ORDER BY ta.task_date DESC, ta.start_time DESC;
                """,
                (staff_id,)
            )
            return {"success": True, "tasks": cursor.fetchall()}
        except Exception as error:
            print(f"Get all staff tasks error: {error}")
            return {"success": False, "message": "Failed to retrieve tasks."}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def complete_task(self, task_id, staff_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """
                UPDATE public.task_allocations
                SET status = 'Completed'
                WHERE id = %s AND staff_id = %s AND status = 'Approved'
                RETURNING id, status;
                """,
                (task_id, staff_id)
            )
            updated = cursor.fetchone()
            connection.commit()
            if not updated:
                return {"success": False, "message": "Task not found or not in Approved status."}
            return {"success": True, "task": dict(updated)}
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Complete task error: {error}")
            return {"success": False, "message": "Failed to complete task."}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def cancel_task_by_staff(self, task_id, staff_id, reason=None):
        if not reason or not reason.strip():
            return {"success": False, "message": "A reason is required to request cancellation."}
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """
                UPDATE public.task_allocations
                SET status = 'Cancellation Requested', cancel_reason = %s
                WHERE id = %s AND staff_id = %s AND status = 'Approved'
                RETURNING id, status;
                """,
                (reason.strip(), task_id, staff_id)
            )
            updated = cursor.fetchone()
            connection.commit()
            if not updated:
                return {"success": False, "message": "Task not found or cannot be cancelled in its current state."}
            return {"success": True, "task": dict(updated)}
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Cancel task by staff error: {error}")
            return {"success": False, "message": "Failed to submit cancellation request."}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_cancellation_requests(self, department_id):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """
                SELECT ta.id, ta.task_name, ta.task_date, ta.start_time, ta.end_time,
                       ta.cancel_reason, ta.status,
                       p.full_name AS staff_name
                FROM public.task_allocations ta
                JOIN public.profiles p ON p.id = ta.staff_id
                WHERE ta.department_id = %s AND ta.status = 'Cancellation Requested'
                ORDER BY ta.task_date ASC;
                """,
                (department_id,)
            )
            return {"success": True, "requests": cursor.fetchall()}
        except Exception as error:
            print(f"Get cancellation requests error: {error}")
            return {"success": False, "requests": []}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def resolve_cancellation(self, task_id, department_id, action):
        if action not in ('approve', 'reject'):
            return {"success": False, "message": "Invalid action."}
        new_status = 'Cancelled' if action == 'approve' else 'Approved'
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                """
                UPDATE public.task_allocations
                SET status = %s
                WHERE id = %s AND department_id = %s AND status = 'Cancellation Requested'
                RETURNING id, status;
                """,
                (new_status, task_id, department_id)
            )
            updated = cursor.fetchone()
            connection.commit()
            if not updated:
                return {"success": False, "message": "Request not found or already resolved."}
            return {"success": True, "task": dict(updated)}
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"Resolve cancellation error: {error}")
            return {"success": False, "message": "Failed to resolve cancellation request."}
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def file_dispute(self, task_id, staff_id, reason, claimed_hours):
        if not reason or not reason.strip():
            return {"success": False, "message": "Reason is required."}
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(
                "SELECT id FROM public.disputes WHERE task_id = %s AND staff_id = %s AND status = 'Pending';",
                (task_id, staff_id)
            )
            if cursor.fetchone():
                return {"success": False, "message": "A pending dispute already exists for this task."}
            cursor.execute(
                """
                INSERT INTO public.disputes (task_id, staff_id, reason, claimed_hours)
                VALUES (%s, %s, %s, %s)
                RETURNING id;
                """,
                (task_id, staff_id, reason.strip(), claimed_hours or None)
            )
            new_id = cursor.fetchone()['id']
            connection.commit()
            return {"success": True, "dispute_id": new_id}
        except Exception as error:
            if connection: connection.rollback()
            print(f"File dispute error: {error}")
            return {"success": False, "message": "Failed to file dispute."}
        finally:
            if cursor: cursor.close()
            if connection: connection.close()

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