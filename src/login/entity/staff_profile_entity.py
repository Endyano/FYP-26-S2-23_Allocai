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

