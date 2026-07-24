from db import Database


class CompanyEntity:

    @staticmethod
    def get_all():
        query = """
            SELECT
                c.company_id,
                c.company_name,
                c.company_email,
                c.company_phone,
                c.company_address,
                c.company_status,
                c.created_at,
                c.updated_at,
                u.full_name AS created_by_name,
                u.email AS created_by_email
            FROM companies c
            LEFT JOIN users u ON u.user_id = c.created_by
            ORDER BY c.created_at DESC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def update_status(company_id, company_status):
        query = """
            UPDATE companies
            SET company_status = %s,
                updated_at = NOW()
            WHERE company_id = %s
            RETURNING *;
        """
        return Database.execute(query, (company_status, company_id))

    @staticmethod
    def get_company_status_summary():
        query = """
            SELECT company_status, COUNT(*) AS total
            FROM companies
            GROUP BY company_status
            ORDER BY company_status ASC;
        """
        return Database.fetch_all(query)