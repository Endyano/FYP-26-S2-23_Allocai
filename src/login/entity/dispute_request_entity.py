from db import Database


class DisputeRequestEntity:

    @staticmethod
    def get_pending_by_company(company_id):
        query = """
            SELECT
                dr.*,
                u.full_name,
                u.email,
                t.task_title,
                whr.hours_worked
            FROM dispute_requests dr
            JOIN company_members cm ON cm.company_member_id = dr.requested_by
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN working_hour_records whr ON whr.working_hour_id = dr.working_hour_id
            LEFT JOIN task_allocations ta
                ON ta.allocation_id = whr.allocation_id
                AND ta.company_id = whr.company_id
            LEFT JOIN tasks t ON t.task_id = ta.task_id
            WHERE dr.company_id = %s
            ORDER BY dr.created_at DESC;
        """
        return Database.fetch_all(query, (company_id,))

    @staticmethod
    def get_by_member(company_id, company_member_id):
        query = """
            SELECT
                dr.dispute_request_id,
                dr.working_hour_id,
                dr.reason,
                dr.requested_hours,
                dr.current_recorded_hours,
                dr.dispute_status,
                dr.created_at,
                dr.reviewed_at,
                t.task_id,
                t.task_title,
                t.task_date
            FROM dispute_requests dr
            LEFT JOIN working_hour_records whr ON whr.working_hour_id = dr.working_hour_id
            LEFT JOIN task_allocations ta
                ON ta.allocation_id = whr.allocation_id
                AND ta.company_id = whr.company_id
            LEFT JOIN tasks t ON t.task_id = ta.task_id
            WHERE dr.company_id = %s
            AND dr.requested_by = %s
            ORDER BY dr.created_at DESC;
        """
        return Database.fetch_all(query, (company_id, company_member_id))

    @staticmethod
    def resolve(company_id, dispute_request_id, status, reviewed_by):
        query = """
            UPDATE dispute_requests
            SET dispute_status = %s,
                reviewed_by = %s,
                reviewed_at = NOW()
            WHERE company_id = %s
            AND dispute_request_id = %s
            RETURNING *;
        """
        return Database.execute(query, (
            status,
            reviewed_by,
            company_id,
            dispute_request_id
        ))

    @staticmethod
    def create(
        company_id,
        company_member_id,
        working_hour_id,
        reason,
        requested_hours
    ):
        query = """
            INSERT INTO dispute_requests (
                company_id,
                working_hour_id,
                requested_by,
                reason,
                requested_hours,
                current_recorded_hours,
                dispute_status,
                created_at
            )
            SELECT
                wh.company_id,
                wh.working_hour_id,
                %s,
                %s,
                %s,
                wh.hours_worked,
                'pending',
                NOW()
            FROM working_hour_records wh
            JOIN task_allocations ta
                ON ta.allocation_id = wh.allocation_id
                AND ta.company_id = wh.company_id
            WHERE wh.company_id = %s
            AND ta.assigned_to = %s
            AND wh.working_hour_id = %s
            AND wh.hours_worked <> %s
            AND NOT EXISTS (
                SELECT 1
                FROM dispute_requests dr
                WHERE dr.company_id = wh.company_id
                AND dr.working_hour_id = wh.working_hour_id
                AND dr.dispute_status = 'pending'
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_member_id,
                reason,
                requested_hours,
                company_id,
                company_member_id,
                working_hour_id,
                requested_hours
            )
        )
