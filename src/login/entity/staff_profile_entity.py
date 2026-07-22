from db import Database


class StaffProfileEntity:

    @staticmethod
    def get_staff(company_id, search=None, skillset_id=None, availability_date=None):
        params = [company_id]

        query = """
            SELECT DISTINCT
                sp.staff_profile_id,
                sp.company_id,
                sp.company_member_id,
                sp.staff_id,
                sp.job_title,
                sp.employee_type,
                sp.contact_number,
                sp.profile_description,
                sp.profile_status,
                u.full_name,
                u.email,
                cm.role,
                cm.member_status,
                pwr.max_working_hours,
                pwr.current_working_hours,
                pwr.remaining_eligible_hours,
                pwr.eligibility_status
            FROM staff_profiles sp
            JOIN company_members cm ON cm.company_member_id = sp.company_member_id
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN part_time_work_rules pwr
                ON pwr.company_member_id = sp.company_member_id
                AND pwr.company_id = sp.company_id
                AND pwr.rule_status = 'Active'
            WHERE sp.company_id = %s
            AND sp.profile_status = 'Active'
            AND cm.member_status = 'Active'
        """

        if search:
            query += """
                AND (
                    LOWER(u.full_name) LIKE LOWER(%s)
                    OR LOWER(sp.staff_id) LIKE LOWER(%s)
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
                    AND av.availability_status = 'Available'
                )
            """
            params.append(availability_date)

        query += " ORDER BY u.full_name ASC;"

        return Database.fetch_all(query, tuple(params))

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
                sp.staff_id,
                sp.job_title,
                sp.employee_type,
                sp.contact_number,
                sp.profile_description,
                sp.profile_status,
                cm.company_member_id,
                cm.company_id,
                cm.role,
                cm.member_status,
                u.user_id,
                u.full_name,
                u.email,
                u.phone_number
            FROM staff_profiles sp
            JOIN company_members cm
                ON cm.company_member_id = sp.company_member_id
                AND cm.company_id = sp.company_id
            JOIN users u
                ON u.user_id = cm.user_id
            WHERE sp.company_id = %s
            AND sp.company_member_id = %s
            AND sp.profile_status = 'Active'
            AND cm.member_status = 'Active';
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
                AND member_status = 'Active'
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
                sp.staff_id,
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