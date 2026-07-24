from db import Database


class AuditLogEntity:

    @staticmethod
    def get_recent_logs():
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
                u.full_name,
                u.email,
                c.company_name
            FROM audit_logs al
            LEFT JOIN users u ON u.user_id = al.user_id
            LEFT JOIN companies c ON c.company_id = al.company_id
            ORDER BY al.created_at DESC
            LIMIT 100;
        """
        return Database.fetch_all(query)