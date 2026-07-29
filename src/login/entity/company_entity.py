from db import Database


class CompanyEntity:

    @staticmethod
    def create(company_name, company_email, company_phone, company_address, created_by, industry=None):
        query = """
            INSERT INTO companies (
                company_name,
                company_email,
                company_phone,
                company_address,
                industry,
                created_by
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_name,
                company_email,
                company_phone,
                company_address,
                industry,
                created_by
            )
        )

    @staticmethod
    def get_by_id(company_id):
        # Get one company using its company ID
        query = """
            SELECT
                company_id,
                company_name,
                company_email,
                company_phone,
                company_address,
                industry,
                company_status,
                created_by,
                created_at,
                updated_at
            FROM companies
            WHERE company_id = %s;
        """

        return Database.fetch_one(
            query,
            (company_id,)
        )

    @staticmethod
    def update(company_id, data):
        # Update the company information
        query = """
            UPDATE companies
            SET
                company_name = COALESCE(
                    %s,
                    company_name
                ),
                company_email = COALESCE(
                    %s,
                    company_email
                ),
                company_phone = COALESCE(
                    %s,
                    company_phone
                ),
                company_address = COALESCE(
                    %s,
                    company_address
                ),
                industry = COALESCE(
                    %s,
                    industry
                ),
                updated_at = NOW()
            WHERE company_id = %s
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                data.get("company_name"),
                data.get("company_email"),
                data.get("company_phone"),
                data.get("company_address"),
                data.get("industry"),
                company_id
            )
        )

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