from db import Database


class TaskAllocationEntity:

    @staticmethod
    def get_for_member(company_id, company_member_id, allocation_id):
        query = """
            SELECT
                ta.allocation_id,
                ta.allocation_status,
                t.task_id,
                t.task_date,
                t.start_time,
                t.end_time
            FROM task_allocations ta
            JOIN tasks t ON t.task_id = ta.task_id AND t.company_id = ta.company_id
            WHERE ta.company_id = %s
            AND ta.assigned_to = %s
            AND ta.allocation_id = %s;
        """
        return Database.fetch_one(query, (company_id, company_member_id, allocation_id))

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
            VALUES (%s, %s, %s, %s, 'pending', NOW())
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
                    WHEN %s IN ('accepted', 'declined', 'cancelled') THEN NOW()
                    ELSE response_at
                END,
                completed_at = CASE
                    WHEN %s = 'completed' THEN NOW()
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
            SET allocation_status = 'cancelled',
                response_at = NOW()
            WHERE company_id = %s
            AND task_id = %s
            AND allocation_status NOT IN ('completed', 'cancelled')
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
            AND ta.allocation_status IN ('pending', 'accepted')
            AND NOT (%s >= t.end_time OR %s <= t.start_time)
            LIMIT 1;
        """
        return Database.fetch_one(
            query,
            (company_id, company_member_id, task_date, start_time, end_time)
        ) is not None
    
    @staticmethod
    def get_assigned_tasks(company_id, company_member_id):
        query = """
            SELECT
                ta.allocation_id,
                ta.allocation_status,
                ta.assigned_at,
                ta.response_at,
                t.task_id,
                t.task_title,
                t.task_description,
                t.task_date,
                t.start_time,
                t.end_time,
                t.priority_level,
                t.task_status,
                d.department_name,
                s.skillset_name
            FROM task_allocations ta
            JOIN tasks t
                ON t.task_id = ta.task_id
                AND t.company_id = ta.company_id
            LEFT JOIN departments d
                ON d.department_id = t.department_id
            LEFT JOIN task_skillsets ts
                ON ts.task_id = t.task_id
            LEFT JOIN skillsets s
                ON s.skillset_id = ts.skillset_id
            WHERE ta.company_id = %s
            AND ta.assigned_to = %s
            AND ta.allocation_status IN ('pending', 'accepted')
            AND t.task_status != 'cancelled'
            AND t.task_date >= CURRENT_DATE
            ORDER BY
                t.task_date ASC,
                t.start_time ASC;
        """

        return Database.fetch_all(
            query,
            (company_id, company_member_id)
        )
    
    @staticmethod
    def get_task_history(company_id, company_member_id):
        query = """
            SELECT
                ta.allocation_id,
                ta.allocation_status,
                ta.assigned_at,
                ta.response_at,
                ta.completed_at,
                t.task_id,
                t.task_title,
                t.task_description,
                t.task_date,
                t.start_time,
                t.end_time,
                t.priority_level,
                t.task_status,
                d.department_name,
                s.skillset_name
            FROM task_allocations ta
            JOIN tasks t
                ON t.task_id = ta.task_id
                AND t.company_id = ta.company_id
            LEFT JOIN departments d
                ON d.department_id = t.department_id
            LEFT JOIN task_skillsets ts
                ON ts.task_id = t.task_id
            LEFT JOIN skillsets s
                ON s.skillset_id = ts.skillset_id
            WHERE ta.company_id = %s
            AND ta.assigned_to = %s
            AND (
                ta.allocation_status IN (
                    'completed',
                    'declined',
                    'cancelled'
                )
                OR t.task_date < CURRENT_DATE
            )
            ORDER BY
                t.task_date DESC,
                t.start_time DESC;
        """

        return Database.fetch_all(
            query,
            (company_id, company_member_id)
        )

    @staticmethod
    def search_assigned_tasks(
        company_id,
        company_member_id,
        search
    ):
        search_value = f"%{search}%"

        query = """
            SELECT
                ta.allocation_id,
                ta.allocation_status,
                ta.assigned_at,
                ta.response_at,
                ta.completed_at,
                t.task_id,
                t.task_title,
                t.task_description,
                t.task_date,
                t.start_time,
                t.end_time,
                t.priority_level,
                t.task_status,
                d.department_name,
                s.skillset_name
            FROM task_allocations ta
            JOIN tasks t
                ON t.task_id = ta.task_id
                AND t.company_id = ta.company_id
            LEFT JOIN departments d
                ON d.department_id = t.department_id
            LEFT JOIN task_skillsets ts
                ON ts.task_id = t.task_id
            LEFT JOIN skillsets s
                ON s.skillset_id = ts.skillset_id
            WHERE ta.company_id = %s
            AND ta.assigned_to = %s
            AND ta.allocation_status IN (
                'pending',
                'accepted',
                'completed'
            )
            AND (
                LOWER(t.task_title) LIKE LOWER(%s)
                OR LOWER(COALESCE(t.task_description, ''))
                    LIKE LOWER(%s)
                OR LOWER(COALESCE(d.department_name, ''))
                    LIKE LOWER(%s)
                OR CAST(t.task_date AS TEXT) LIKE %s
            )
            ORDER BY
                t.task_date DESC,
                t.start_time ASC;
        """

        return Database.fetch_all(
            query,
            (
                company_id,
                company_member_id,
                search_value,
                search_value,
                search_value,
                search_value
            )
        )

    @staticmethod
    def respond_to_allocation(
        company_id,
        company_member_id,
        allocation_id,
        allocation_status
    ):
        query = """
            UPDATE task_allocations
            SET
                allocation_status = %s,
                response_at = NOW()
            WHERE company_id = %s
            AND assigned_to = %s
            AND allocation_id = %s
            AND allocation_status = 'pending'
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                allocation_status,
                company_id,
                company_member_id,
                allocation_id
            )
        )

    @staticmethod
    def complete_allocation(
        company_id,
        company_member_id,
        allocation_id
    ):
        query = """
            WITH completed_allocation AS (
                UPDATE task_allocations
                SET
                    allocation_status = 'completed',
                    completed_at = NOW()
                WHERE company_id = %s
                AND assigned_to = %s
                AND allocation_id = %s
                AND allocation_status = 'accepted'
                AND EXISTS (
                    SELECT 1
                    FROM tasks t
                    WHERE t.task_id = task_allocations.task_id
                    AND t.company_id = task_allocations.company_id
                    AND (
                        t.task_date < CURRENT_DATE
                        OR (t.task_date = CURRENT_DATE AND t.end_time <= CURRENT_TIME)
                    )
                )
                RETURNING *
            ),
            completed_task AS (
                UPDATE tasks t
                SET
                    task_status = 'completed',
                    updated_at = NOW()
                FROM completed_allocation ca
                WHERE t.company_id = ca.company_id
                AND t.task_id = ca.task_id
                RETURNING
                    ca.allocation_id,
                    ca.allocation_status,
                    ca.assigned_to,
                    ca.completed_at,
                    ca.company_id,
                    t.task_id,
                    t.task_title,
                    t.task_status,
                    t.task_date,
                    t.start_time,
                    t.end_time
            ),
            logged_hours AS (
                INSERT INTO working_hour_records (
                    company_id,
                    allocation_id,
                    work_date,
                    start_time,
                    end_time,
                    hours_worked,
                    record_status
                )
                SELECT
                    company_id,
                    allocation_id,
                    task_date,
                    start_time,
                    end_time,
                    ROUND(
                        EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0,
                        2
                    ),
                    'recorded'
                FROM completed_task
                RETURNING allocation_id, working_hour_id, hours_worked
            )
            SELECT
                ct.allocation_id,
                ct.allocation_status,
                ct.assigned_to,
                ct.completed_at,
                ct.task_id,
                ct.task_title,
                ct.task_status,
                lh.working_hour_id,
                lh.hours_worked
            FROM completed_task ct
            JOIN logged_hours lh ON lh.allocation_id = ct.allocation_id;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id,
                allocation_id
            )
        )