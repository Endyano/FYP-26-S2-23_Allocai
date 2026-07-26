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

    @staticmethod
    def create(
        company_id,
        company_member_id,
        allocation_id,
        reason
    ):
        query = """
            INSERT INTO task_cancellation_requests (
                company_id,
                task_id,
                allocation_id,
                requested_by,
                reason,
                request_status,
                created_at
            )
            SELECT
                ta.company_id,
                ta.task_id,
                ta.allocation_id,
                ta.assigned_to,
                %s,
                'Pending',
                NOW()
            FROM task_allocations ta
            WHERE ta.company_id = %s
            AND ta.assigned_to = %s
            AND ta.allocation_id = %s
            AND ta.allocation_status = 'Accepted'
            AND NOT EXISTS (
                SELECT 1
                FROM task_cancellation_requests tcr
                WHERE tcr.company_id = ta.company_id
                AND tcr.allocation_id = ta.allocation_id
                AND tcr.request_status = 'Pending'
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                reason,
                company_id,
                company_member_id,
                allocation_id
            )
        )