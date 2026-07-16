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