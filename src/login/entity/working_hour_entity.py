from db import Database
from entity.work_rule_entity import WorkRuleEntity


class WorkingHourEntity:

    @staticmethod
    def get_hours_dashboard(company_id):
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
                sp.company_member_id,
                sp.staff_code AS staff_id,
                sp.employee_type,
                u.full_name,
                u.email,
                rp.max_working_hours,
                rp.rule_period,
                COALESCE(SUM(whr.hours_worked), 0) AS current_working_hours,
                CASE
                    WHEN rp.max_working_hours IS NOT NULL
                        THEN rp.max_working_hours - COALESCE(SUM(whr.hours_worked), 0)
                    ELSE NULL
                END AS remaining_eligible_hours
            FROM staff_profiles sp
            JOIN company_members cm ON cm.company_member_id = sp.company_member_id
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
            GROUP BY
                sp.company_member_id,
                sp.staff_code,
                sp.employee_type,
                u.full_name,
                u.email,
                rp.max_working_hours,
                rp.rule_period
            ORDER BY u.full_name ASC;
        """

        rows = Database.fetch_all(query, (company_id, company_id))

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
    def get_by_member(company_id, company_member_id):
        query = """
            SELECT
                whr.working_hour_id,
                whr.hours_worked,
                whr.work_date,
                whr.record_status,
                t.task_id,
                t.task_title,
                d.department_name
            FROM working_hour_records whr
            JOIN task_allocations ta
                ON ta.allocation_id = whr.allocation_id
                AND ta.company_id = whr.company_id
            JOIN tasks t ON t.task_id = ta.task_id
            LEFT JOIN departments d ON d.department_id = t.department_id
            WHERE whr.company_id = %s
            AND ta.assigned_to = %s
            ORDER BY whr.work_date DESC;
        """
        return Database.fetch_all(query, (company_id, company_member_id))

    @staticmethod
    def get_monthly_report(company_id, year, month):
        query = """
            SELECT
                sp.company_member_id AS id,
                u.full_name,
                COALESCE(SUM(whr.hours_worked), 0) AS monthly_hours,
                swr.max_working_hours AS monthly_limit
            FROM staff_profiles sp
            JOIN company_members cm ON cm.company_member_id = sp.company_member_id
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN staff_work_rules swr
                ON swr.company_id = sp.company_id
                AND swr.company_member_id = sp.company_member_id
                AND swr.rule_status = 'Active'
            LEFT JOIN task_allocations ta
                ON ta.company_id = sp.company_id
                AND ta.assigned_to = sp.company_member_id
            LEFT JOIN working_hour_records whr
                ON whr.company_id = sp.company_id
                AND whr.allocation_id = ta.allocation_id
                AND whr.record_status != 'disputed'
                AND EXTRACT(YEAR FROM whr.work_date) = %s
                AND EXTRACT(MONTH FROM whr.work_date) = %s
            WHERE sp.company_id = %s
            GROUP BY sp.company_member_id, u.full_name, swr.max_working_hours
            ORDER BY u.full_name ASC;
        """

        rows = Database.fetch_all(query, (year, month, company_id))

        for row in rows:
            monthly_hours = float(row["monthly_hours"])
            monthly_limit = row["monthly_limit"]

            if monthly_limit is None:
                row["over_limit"] = False
                row["exceed_pct"] = 0
                continue

            monthly_limit = float(monthly_limit)
            row["over_limit"] = monthly_hours > monthly_limit
            row["exceed_pct"] = (
                round(((monthly_hours - monthly_limit) / monthly_limit) * 100)
                if row["over_limit"] and monthly_limit > 0
                else 0
            )

        return rows

    @staticmethod
    def update_hours(company_id, working_hour_id, hours_worked):
        query = """
            UPDATE working_hour_records
            SET hours_worked = %s,
                record_status = 'adjusted'
            WHERE company_id = %s
            AND working_hour_id = %s
            RETURNING *;
        """
        return Database.execute(query, (hours_worked, company_id, working_hour_id))
