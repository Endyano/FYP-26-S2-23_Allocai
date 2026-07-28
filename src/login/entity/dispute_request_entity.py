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
            JOIN company_members cm ON cm.company_member_id = dr.company_member_id
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN tasks t ON t.task_id = dr.task_id
            LEFT JOIN working_hour_records whr ON whr.working_hour_id = dr.working_hour_id
            WHERE dr.company_id = %s
            ORDER BY dr.created_at DESC;
        """
        return Database.fetch_all(query, (company_id,))

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
                company_member_id,
                working_hour_id,
                task_id,
                reason,
                requested_hours,
                current_recorded_hours,
                dispute_status,
                created_at
            )
            SELECT
                wh.company_id,
                wh.company_member_id,
                wh.working_hour_id,
                wh.task_id,
                %s,
                %s,
                wh.hours_worked,
                'Pending',
                NOW()
            FROM working_hour_records wh
            WHERE wh.company_id = %s
            AND wh.company_member_id = %s
            AND wh.working_hour_id = %s
            AND wh.hours_worked <> %s
            AND NOT EXISTS (
                SELECT 1
                FROM dispute_requests dr
                WHERE dr.company_id = wh.company_id
                AND dr.working_hour_id = wh.working_hour_id
                AND dr.dispute_status = 'Pending'
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                reason,
                requested_hours,
                company_id,
                company_member_id,
                working_hour_id,
                requested_hours
            )
        )