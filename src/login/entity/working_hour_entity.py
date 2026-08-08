from db import Database


class WorkingHourEntity:

    @staticmethod
    def get_by_member(company_id, company_member_id):
        query = """
            SELECT
                whr.working_hour_id,
                whr.hours_worked,
                whr.work_date,
                whr.record_status,
                t.task_id,
                t.task_title,
                d.department_name
            FROM working_hour_records whr
            JOIN task_allocations ta
                ON ta.allocation_id = whr.allocation_id
                AND ta.company_id = whr.company_id
            JOIN tasks t ON t.task_id = ta.task_id
            LEFT JOIN departments d ON d.department_id = t.department_id
            WHERE whr.company_id = %s
            AND ta.assigned_to = %s
            ORDER BY whr.work_date DESC;
        """
        return Database.fetch_all(query, (company_id, company_member_id))

    @staticmethod
    def update_hours(company_id, working_hour_id, hours_worked):
        query = """
            UPDATE working_hour_records
            SET hours_worked = %s,
                record_status = 'adjusted'
            WHERE company_id = %s
            AND working_hour_id = %s
            RETURNING *;
        """
        return Database.execute(query, (hours_worked, company_id, working_hour_id))
