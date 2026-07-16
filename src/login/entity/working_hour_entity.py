from db import Database


class WorkingHourEntity:

    @staticmethod
    def get_hours_dashboard(company_id):
        query = """
            SELECT
                sp.company_member_id,
                sp.staff_id,
                sp.employee_type,
                u.full_name,
                u.email,
                COALESCE(SUM(whr.hours_worked), 0) AS total_hours_worked,
                pwr.max_working_hours,
                pwr.current_working_hours,
                pwr.remaining_eligible_hours,
                pwr.eligibility_status
            FROM staff_profiles sp
            JOIN company_members cm ON cm.company_member_id = sp.company_member_id
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN working_hour_records whr
                ON whr.company_member_id = sp.company_member_id
                AND whr.company_id = sp.company_id
                AND whr.record_status = 'Approved'
            LEFT JOIN part_time_work_rules pwr
                ON pwr.company_member_id = sp.company_member_id
                AND pwr.company_id = sp.company_id
                AND pwr.rule_status = 'Active'
            WHERE sp.company_id = %s
            GROUP BY
                sp.company_member_id,
                sp.staff_id,
                sp.employee_type,
                u.full_name,
                u.email,
                pwr.max_working_hours,
                pwr.current_working_hours,
                pwr.remaining_eligible_hours,
                pwr.eligibility_status
            ORDER BY u.full_name ASC;
        """
        return Database.fetch_all(query, (company_id,))

    @staticmethod
    def update_hours(company_id, working_hour_id, hours_worked):
        query = """
            UPDATE working_hour_records
            SET hours_worked = %s,
                record_status = 'Adjusted'
            WHERE company_id = %s
            AND working_hour_id = %s
            RETURNING *;
        """
        return Database.execute(query, (hours_worked, company_id, working_hour_id))