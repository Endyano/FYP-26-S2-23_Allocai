from db import Database


class TaskAllocationEntity:

    @staticmethod
    def create(company_id, task_id, assigned_to, assigned_by):
        query = """
            INSERT INTO task_allocations (
                company_id,
                task_id,
                assigned_to,
                assigned_by,
                allocation_status,
                assigned_at
            )
            VALUES (%s, %s, %s, %s, 'Assigned', NOW())
            RETURNING *;
        """
        return Database.execute(query, (company_id, task_id, assigned_to, assigned_by))

    @staticmethod
    def get_status_summary(company_id):
        query = """
            SELECT allocation_status, COUNT(*) AS total
            FROM task_allocations
            WHERE company_id = %s
            GROUP BY allocation_status
            ORDER BY allocation_status ASC;
        """
        return Database.fetch_all(query, (company_id,))

    @staticmethod
    def update_status(company_id, allocation_id, allocation_status):
        query = """
            UPDATE task_allocations
            SET allocation_status = %s,
                response_at = CASE
                    WHEN %s IN ('Accepted', 'Declined', 'Cancelled') THEN NOW()
                    ELSE response_at
                END,
                completed_at = CASE
                    WHEN %s = 'Completed' THEN NOW()
                    ELSE completed_at
                END
            WHERE company_id = %s
            AND allocation_id = %s
            RETURNING *;
        """
        return Database.execute(query, (
            allocation_status,
            allocation_status,
            allocation_status,
            company_id,
            allocation_id
        ))

    @staticmethod
    def cancel_by_task(company_id, task_id):
        query = """
            UPDATE task_allocations
            SET allocation_status = 'Cancelled',
                response_at = NOW()
            WHERE company_id = %s
            AND task_id = %s
            AND allocation_status NOT IN ('Completed', 'Cancelled')
            RETURNING *;
        """
        return Database.execute(query, (company_id, task_id))

    @staticmethod
    def has_time_conflict(company_id, company_member_id, task_date, start_time, end_time):
        query = """
            SELECT ta.allocation_id
            FROM task_allocations ta
            JOIN tasks t ON t.task_id = ta.task_id
            WHERE ta.company_id = %s
            AND ta.assigned_to = %s
            AND t.task_date = %s
            AND ta.allocation_status IN ('Assigned', 'Accepted')
            AND NOT (%s >= t.end_time OR %s <= t.start_time)
            LIMIT 1;
        """
        return Database.fetch_one(
            query,
            (company_id, company_member_id, task_date, start_time, end_time)
        ) is not None