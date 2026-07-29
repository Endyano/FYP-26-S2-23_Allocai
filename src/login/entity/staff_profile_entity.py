from db import Database
from entity.work_rule_entity import WorkRuleEntity


class StaffProfileEntity:

    @staticmethod
    def create(company_id, company_member_id, employee_type, department_id=None):
        query = """
            INSERT INTO staff_profiles (
                company_id,
                company_member_id,
                employee_type,
                department_id,
                profile_status
            )
            VALUES (%s, %s, %s, %s, 'Active')
            RETURNING *;
        """

        return Database.execute(
            query,
            (company_id, company_member_id, employee_type, department_id)
        )

    @staticmethod
    def get_staff(company_id, search=None, skillset_id=None, availability_date=None):
        params = [company_id, company_id]

        query = f"""
            WITH rule_periods AS (
                SELECT
                    company_id,
                    company_member_id,
                    max_working_hours,
                    rule_period,
                    {WorkRuleEntity.PERIOD_START_CASE} AS period_start
                FROM staff_work_rules
                WHERE company_id = %s
                AND rule_status = 'Active'
            )
            SELECT
                sp.staff_profile_id,
                sp.company_id,
                sp.company_member_id,
                sp.staff_code AS staff_id,
                sp.job_title,
                sp.employee_type,
                sp.contact_number,
                sp.profile_description,
                sp.profile_status,
                u.full_name,
                u.email,
                r.role_name AS role,
                cm.member_status,
                rp.max_working_hours,
                COALESCE(SUM(whr.hours_worked), 0) AS current_working_hours,
                CASE
                    WHEN rp.max_working_hours IS NOT NULL
                        THEN rp.max_working_hours - COALESCE(SUM(whr.hours_worked), 0)
                    ELSE NULL
                END AS remaining_eligible_hours
            FROM staff_profiles sp
            JOIN company_members cm ON cm.company_member_id = sp.company_member_id
            JOIN member_roles mr ON mr.company_member_id = cm.company_member_id
            JOIN roles r ON r.role_id = mr.role_id
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN rule_periods rp
                ON rp.company_id = sp.company_id
                AND rp.company_member_id = sp.company_member_id
            LEFT JOIN task_allocations ta
                ON ta.company_id = sp.company_id
                AND ta.assigned_to = sp.company_member_id
            LEFT JOIN working_hour_records whr
                ON whr.company_id = sp.company_id
                AND whr.allocation_id = ta.allocation_id
                AND whr.record_status != 'disputed'
                AND (rp.period_start IS NULL OR whr.work_date >= rp.period_start)
            WHERE sp.company_id = %s
            AND sp.profile_status = 'Active'
            AND cm.member_status = 'active'
        """

        if search:
            query += """
                AND (
                    LOWER(u.full_name) LIKE LOWER(%s)
                    OR LOWER(sp.staff_code) LIKE LOWER(%s)
                    OR CAST(sp.company_member_id AS TEXT) LIKE %s
                )
            """
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

        if skillset_id:
            query += """
                AND EXISTS (
                    SELECT 1
                    FROM staff_skillsets ss
                    WHERE ss.company_id = sp.company_id
                    AND ss.company_member_id = sp.company_member_id
                    AND ss.skillset_id = %s
                )
            """
            params.append(skillset_id)

        if availability_date:
            query += """
                AND EXISTS (
                    SELECT 1
                    FROM availability_schedules av
                    WHERE av.company_id = sp.company_id
                    AND av.company_member_id = sp.company_member_id
                    AND av.available_date = %s
                    AND av.availability_status = 'available'
                )
            """
            params.append(availability_date)

        query += """
            GROUP BY
                sp.staff_profile_id,
                sp.company_id,
                sp.company_member_id,
                sp.staff_code,
                sp.job_title,
                sp.employee_type,
                sp.contact_number,
                sp.profile_description,
                sp.profile_status,
                u.full_name,
                u.email,
                r.role_name,
                cm.member_status,
                rp.max_working_hours
            ORDER BY u.full_name ASC;
        """

        rows = Database.fetch_all(query, tuple(params))

        for row in rows:
            remaining = row.get("remaining_eligible_hours")

            if remaining is None:
                row["eligibility_status"] = None
            elif float(remaining) <= 0:
                row["eligibility_status"] = "at_limit"
            else:
                row["eligibility_status"] = "eligible"

        return rows

    @staticmethod
    def get_by_member_id(company_id, company_member_id):
        query = """
            SELECT *
            FROM staff_profiles
            WHERE company_id = %s
            AND company_member_id = %s
            AND profile_status = 'Active';
        """
        return Database.fetch_one(query, (company_id, company_member_id))

    @staticmethod
    def get_my_profile(company_id, company_member_id):
        query = """
            SELECT
                sp.staff_profile_id,
                sp.staff_code AS staff_id,
                sp.job_title,
                sp.employee_type,
                sp.contact_number,
                sp.profile_description,
                sp.profile_status,
                cm.company_member_id,
                cm.company_id,
                r.role_name AS role,
                cm.member_status,
                u.user_id,
                u.full_name,
                u.email,
                u.phone_number
            FROM staff_profiles sp
            JOIN company_members cm
                ON cm.company_member_id = sp.company_member_id
                AND cm.company_id = sp.company_id
            JOIN member_roles mr
                ON mr.company_member_id = cm.company_member_id
            JOIN roles r
                ON r.role_id = mr.role_id
            JOIN users u
                ON u.user_id = cm.user_id
            WHERE sp.company_id = %s
            AND sp.company_member_id = %s
            AND sp.profile_status = 'Active'
            AND cm.member_status = 'active';
        """

        return Database.fetch_one(
            query,
            (company_id, company_member_id)
        )

    @staticmethod
    def update_my_profile(company_id, company_member_id, data):
        query = """
            WITH member_user AS (
                SELECT user_id
                FROM company_members
                WHERE company_id = %s
                AND company_member_id = %s
                AND member_status = 'active'
            ),
            updated_user AS (
                UPDATE users u
                SET
                    full_name = COALESCE(%s, u.full_name),
                    phone_number = COALESCE(%s, u.phone_number),
                    updated_at = NOW()
                FROM member_user mu
                WHERE u.user_id = mu.user_id
                RETURNING
                    u.user_id,
                    u.full_name,
                    u.email,
                    u.phone_number
            )
            UPDATE staff_profiles sp
            SET
                contact_number = COALESCE(%s, sp.contact_number),
                profile_description = COALESCE(
                    %s,
                    sp.profile_description
                ),
                updated_at = NOW()
            FROM updated_user uu
            WHERE sp.company_id = %s
            AND sp.company_member_id = %s
            AND sp.profile_status = 'Active'
            RETURNING
                sp.staff_profile_id,
                sp.staff_code AS staff_id,
                sp.job_title,
                sp.employee_type,
                sp.contact_number,
                sp.profile_description,
                uu.user_id,
                uu.full_name,
                uu.email,
                uu.phone_number;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id,
                data.get("full_name"),
                data.get("phone_number"),
                data.get("contact_number"),
                data.get("profile_description"),
                company_id,
                company_member_id
            )
        )