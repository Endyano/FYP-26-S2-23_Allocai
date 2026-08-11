from db import Database


class CompanyMemberEntity:

    @staticmethod
    def create(company_id, user_id, member_status="active"):
        # Add a user as a member of a company
        query = """
            INSERT INTO company_members (
                company_id,
                user_id,
                member_status
            )
            VALUES (%s, %s, %s)
            RETURNING *;
        """

        return Database.execute(
            query,
            (company_id, user_id, member_status)
        )

    @staticmethod
    def get_active_member_by_user_and_role(user_id, role):
        query = """
            SELECT
                cm.company_member_id,
                cm.company_id,
                cm.user_id,
                r.role_name AS role,
                cm.member_status
            FROM company_members cm
            JOIN member_roles mr
                ON mr.company_member_id = cm.company_member_id
            JOIN roles r
                ON r.role_id = mr.role_id
            JOIN companies c
                ON c.company_id = cm.company_id
            WHERE cm.user_id = %s
            AND LOWER(r.role_name) = LOWER(%s)
            AND cm.member_status = 'active'
            AND c.company_status = 'active'
            ORDER BY cm.joined_at DESC
            LIMIT 1;
        """
        return Database.fetch_one(query, (user_id, role))

    @staticmethod
    def get_membership_status(user_id, role):
        # Looked up ignoring status filters, purely to explain to a blocked
        # user *why* they were denied login access to this role.
        query = """
            SELECT cm.member_status, c.company_status
            FROM company_members cm
            JOIN member_roles mr
                ON mr.company_member_id = cm.company_member_id
            JOIN roles r
                ON r.role_id = mr.role_id
            JOIN companies c
                ON c.company_id = cm.company_id
            WHERE cm.user_id = %s
            AND LOWER(r.role_name) = LOWER(%s)
            ORDER BY cm.joined_at DESC
            LIMIT 1;
        """
        return Database.fetch_one(query, (user_id, role))

    @staticmethod
    def get_session_validity(user_id, company_member_id):
        # Re-checked on every authenticated request (not just at login) so
        # a suspension takes effect immediately instead of only on next
        # login. company_member_id may be None (platform_admin /
        # registered_user sessions have no workspace membership).
        query = """
            SELECT
                u.account_status,
                cm.member_status,
                c.company_status
            FROM users u
            LEFT JOIN company_members cm
                ON cm.company_member_id = %s
            LEFT JOIN companies c
                ON c.company_id = cm.company_id
            WHERE u.user_id = %s;
        """
        return Database.fetch_one(query, (company_member_id, user_id))

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
                r.role_name AS role,
                cm.member_status,
                cm.joined_at,
                u.full_name,
                u.email,
                u.phone_number,
                u.account_status,
                sp.staff_code AS staff_id,
                sp.job_title,
                sp.employee_type,
                sp.profile_status,
                d.department_name
            FROM company_members cm
            JOIN member_roles mr
                ON mr.company_member_id = cm.company_member_id
            JOIN roles r
                ON r.role_id = mr.role_id
            JOIN users u
                ON u.user_id = cm.user_id
            LEFT JOIN staff_profiles sp
                ON sp.company_id = cm.company_id
                AND sp.company_member_id = cm.company_member_id
            LEFT JOIN departments d
                ON d.department_id = sp.department_id
            WHERE cm.company_id = %s
            AND LOWER(r.role_name) IN (
                'manager',
                'full_time_staff',
                'part_time_staff'
            )
            AND cm.member_status != 'removed'
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
            UPDATE company_members cm
            SET member_status = 'suspended'
            WHERE cm.company_id = %s
            AND cm.company_member_id = %s
            AND cm.member_status = 'active'
            AND EXISTS (
                SELECT 1
                FROM member_roles mr
                JOIN roles r
                    ON r.role_id = mr.role_id
                WHERE mr.company_member_id = cm.company_member_id
                AND LOWER(r.role_name) IN (
                    'manager',
                    'full_time_staff',
                    'part_time_staff'
                )
            )
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
    def unsuspend_employee(company_id, company_member_id):
        # Reactivate a suspended employee membership in this company
        query = """
            UPDATE company_members cm
            SET member_status = 'active'
            WHERE cm.company_id = %s
            AND cm.company_member_id = %s
            AND cm.member_status = 'suspended'
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
            UPDATE company_members cm
            SET member_status = 'removed'
            WHERE cm.company_id = %s
            AND cm.company_member_id = %s
            AND cm.member_status != 'removed'
            AND EXISTS (
                SELECT 1
                FROM member_roles mr
                JOIN roles r
                    ON r.role_id = mr.role_id
                WHERE mr.company_member_id = cm.company_member_id
                AND LOWER(r.role_name) IN (
                    'manager',
                    'full_time_staff',
                    'part_time_staff'
                )
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id
            )
        )
