from db import Database


class CompanyMemberEntity:

    @staticmethod
    def get_active_member_by_user_and_role(user_id, role):
        query = """
            SELECT
                company_member_id,
                company_id,
                user_id,
                role,
                member_status
            FROM company_members
            WHERE user_id = %s
            AND LOWER(role) = LOWER(%s)
            AND member_status = 'Active'
            ORDER BY joined_at DESC
            LIMIT 1;
        """
        return Database.fetch_one(query, (user_id, role))

    @staticmethod
    def get_by_id(company_id, company_member_id):
        query = """
            SELECT *
            FROM company_members
            WHERE company_id = %s
            AND company_member_id = %s;
        """
        return Database.fetch_one(query, (company_id, company_member_id))