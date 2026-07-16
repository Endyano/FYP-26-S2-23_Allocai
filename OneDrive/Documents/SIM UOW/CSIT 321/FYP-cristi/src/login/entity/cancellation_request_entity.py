from db import Database


class CancellationRequestEntity:

    @staticmethod
    def get_pending_by_company(company_id):
        query = """
            SELECT
                tcr.*,
                u.full_name AS requested_by_name,
                t.task_title
            FROM task_cancellation_requests tcr
            JOIN company_members cm ON cm.company_member_id = tcr.requested_by
            JOIN users u ON u.user_id = cm.user_id
            JOIN tasks t ON t.task_id = tcr.task_id
            WHERE tcr.company_id = %s
            ORDER BY tcr.created_at DESC;
        """
        return Database.fetch_all(query, (company_id,))

    @staticmethod
    def resolve(company_id, cancellation_request_id, status, reviewed_by):
        query = """
            UPDATE task_cancellation_requests
            SET request_status = %s,
                reviewed_by = %s,
                reviewed_at = NOW()
            WHERE company_id = %s
            AND cancellation_request_id = %s
            RETURNING *;
        """
        return Database.execute(query, (
            status,
            reviewed_by,
            company_id,
            cancellation_request_id
        ))