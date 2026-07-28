from psycopg2.extras import Json

from db import Database


class AuditLogEntity:

    @staticmethod
    def create(
        company_id,
        user_id,
        action_type,
        target_table,
        target_record_id,
        old_value=None,
        new_value=None
    ):
        # Create a record of an administrative change
        query = """
            INSERT INTO audit_logs (
                company_id,
                user_id,
                action_type,
                target_table,
                target_record_id,
                old_value,
                new_value,
                created_at
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                NOW()
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                user_id,
                action_type,
                target_table,
                target_record_id,
                Json(old_value) if old_value is not None else None,
                Json(new_value) if new_value is not None else None
            )
        )

    @staticmethod
    def get_by_company(
        company_id,
        user_id=None,
        start_date=None,
        end_date=None
    ):
        params = [company_id]

        query = """
            SELECT
                al.audit_log_id,
                al.company_id,
                al.user_id,
                al.action_type,
                al.target_table,
                al.target_record_id,
                al.old_value,
                al.new_value,
                al.created_at,
                u.full_name AS changed_by_name,
                u.email AS changed_by_email
            FROM audit_logs al
            LEFT JOIN users u
                ON u.user_id = al.user_id
            WHERE al.company_id = %s
        """

        if user_id:
            query += " AND al.user_id = %s"
            params.append(user_id)

        if start_date:
            query += " AND al.created_at::date >= %s"
            params.append(start_date)

        if end_date:
            query += " AND al.created_at::date <= %s"
            params.append(end_date)

        query += " ORDER BY al.created_at DESC;"

        return Database.fetch_all(
            query,
            tuple(params)
        )