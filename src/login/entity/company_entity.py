from db import Database


class CompanyEntity:

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
                company_id
            )
        )