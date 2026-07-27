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

    @staticmethod
    def get_employees_by_company(company_id):
        # Get employee accounts belonging to the company
        query = """
            SELECT
                cm.company_member_id,
                cm.company_id,
                cm.user_id,
                cm.role,
                cm.member_status,
                cm.joined_at,
                u.full_name,
                u.email,
                u.phone_number,
                u.account_status,
                sp.staff_id,
                sp.job_title,
                sp.employee_type,
                sp.profile_status
            FROM company_members cm
            JOIN users u
                ON u.user_id = cm.user_id
            LEFT JOIN staff_profiles sp
                ON sp.company_id = cm.company_id
                AND sp.company_member_id = cm.company_member_id
            WHERE cm.company_id = %s
            AND LOWER(cm.role) IN (
                'manager',
                'full_time_staff',
                'part_time_staff'
            )
            AND cm.member_status != 'Removed'
            ORDER BY u.full_name ASC;
        """

        return Database.fetch_all(
            query,
            (company_id,)
        )

    @staticmethod
    def suspend_employee(company_id, company_member_id):
        # Suspend an employee membership in this company
        query = """
            UPDATE company_members
            SET member_status = 'Suspended'
            WHERE company_id = %s
            AND company_member_id = %s
            AND LOWER(role) IN (
                'manager',
                'full_time_staff',
                'part_time_staff'
            )
            AND member_status = 'Active'
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id
            )
        )

    @staticmethod
    def suspend_employee(company_id, company_member_id):
        # Suspend an employee membership in this company
        query = """
            UPDATE company_members
            SET member_status = 'Suspended'
            WHERE company_id = %s
            AND company_member_id = %s
            AND LOWER(role) IN (
                'manager',
                'full_time_staff',
                'part_time_staff'
            )
            AND member_status = 'Active'
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id
            )
        )

    @staticmethod
    def remove_employee(company_id, company_member_id):
        # Remove the employee from this company workspace
        query = """
            UPDATE company_members
            SET member_status = 'Removed'
            WHERE company_id = %s
            AND company_member_id = %s
            AND LOWER(role) IN (
                'manager',
                'full_time_staff',
                'part_time_staff'
            )
            AND member_status != 'Removed'
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id
            )
        )