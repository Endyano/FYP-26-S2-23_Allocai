from datetime import datetime
from db import Database


class TaskEntity:

    @staticmethod
    def create(
        company_id,
        department_id,
        created_by,
        task_title,
        task_description,
        required_skillset_id,
        task_date,
        start_time,
        end_time,
        priority_level
    ):
        query = """
            INSERT INTO tasks (
                company_id,
                department_id,
                created_by,
                task_title,
                task_description,
                required_skillset_id,
                task_date,
                start_time,
                end_time,
                priority_level,
                task_status,
                created_at,
                updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Open', NOW(), NOW())
            RETURNING *;
        """

        return Database.execute(query, (
            company_id,
            department_id,
            created_by,
            task_title,
            task_description,
            required_skillset_id,
            task_date,
            start_time,
            end_time,
            priority_level
        ))

    @staticmethod
    def get_by_company(company_id, status=None):
        params = [company_id]

        query = """
            SELECT
                t.*,
                d.department_name,
                s.skillset_name
            FROM tasks t
            LEFT JOIN departments d ON d.department_id = t.department_id
            LEFT JOIN skillsets s ON s.skillset_id = t.required_skillset_id
            WHERE t.company_id = %s
        """

        if status:
            query += " AND t.task_status = %s"
            params.append(status)

        query += " ORDER BY t.task_date DESC, t.start_time DESC;"

        return Database.fetch_all(query, tuple(params))

    @staticmethod
    def get_by_id(company_id, task_id):
        query = """
            SELECT *
            FROM tasks
            WHERE company_id = %s
            AND task_id = %s;
        """
        return Database.fetch_one(query, (company_id, task_id))

    @staticmethod
    def update(company_id, task_id, data):
        query = """
            UPDATE tasks
            SET
                department_id = COALESCE(%s, department_id),
                task_title = COALESCE(%s, task_title),
                task_description = COALESCE(%s, task_description),
                required_skillset_id = COALESCE(%s, required_skillset_id),
                task_date = COALESCE(%s, task_date),
                start_time = COALESCE(%s, start_time),
                end_time = COALESCE(%s, end_time),
                priority_level = COALESCE(%s, priority_level),
                task_status = COALESCE(%s, task_status),
                updated_at = NOW()
            WHERE company_id = %s
            AND task_id = %s
            RETURNING *;
        """

        return Database.execute(query, (
            data.get("department_id"),
            data.get("task_title"),
            data.get("task_description"),
            data.get("required_skillset_id"),
            data.get("task_date"),
            data.get("start_time"),
            data.get("end_time"),
            data.get("priority_level"),
            data.get("task_status"),
            company_id,
            task_id
        ))

    @staticmethod
    def cancel(company_id, task_id):
        return TaskEntity.update_status(company_id, task_id, "Cancelled")

    @staticmethod
    def update_status(company_id, task_id, task_status):
        query = """
            UPDATE tasks
            SET task_status = %s,
                updated_at = NOW()
            WHERE company_id = %s
            AND task_id = %s
            RETURNING *;
        """
        return Database.execute(query, (task_status, company_id, task_id))

    @staticmethod
    def calculate_task_hours(start_time, end_time):
        start = TaskEntity._to_time(start_time)
        end = TaskEntity._to_time(end_time)

        start_seconds = start.hour * 3600 + start.minute * 60 + start.second
        end_seconds = end.hour * 3600 + end.minute * 60 + end.second

        return max((end_seconds - start_seconds) / 3600, 0)

    @staticmethod
    def _to_time(value):
        if hasattr(value, "hour"):
            return value

        return datetime.strptime(str(value), "%H:%M").time()