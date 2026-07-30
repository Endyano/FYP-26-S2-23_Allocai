from db import Database


class WorkRuleEntity:

    # Rules don't store an explicit period start, so the "current period"
    # is treated as a rolling window ending today, sized by rule_period.
    PERIOD_START_CASE = """
        CASE rule_period
            WHEN 'weekly' THEN CURRENT_DATE - INTERVAL '6 days'
            WHEN 'fortnightly' THEN CURRENT_DATE - INTERVAL '13 days'
            WHEN 'monthly' THEN CURRENT_DATE - INTERVAL '29 days'
        END
    """

    @staticmethod
    def get_by_member(company_id, company_member_id):
        query = f"""
            WITH rule AS (
                SELECT
                    staff_work_rule_id,
                    company_id,
                    company_member_id,
                    max_working_hours,
                    rule_period,
                    rule_status,
                    {WorkRuleEntity.PERIOD_START_CASE} AS period_start
                FROM staff_work_rules
                WHERE company_id = %s
                AND company_member_id = %s
                AND rule_status = 'Active'
            )
            SELECT
                r.staff_work_rule_id,
                r.company_id,
                r.company_member_id,
                r.max_working_hours,
                r.rule_period,
                r.rule_status,
                COALESCE(SUM(whr.hours_worked), 0) AS current_working_hours,
                r.max_working_hours - COALESCE(SUM(whr.hours_worked), 0) AS remaining_eligible_hours
            FROM rule r
            LEFT JOIN task_allocations ta
                ON ta.company_id = r.company_id
                AND ta.assigned_to = r.company_member_id
            LEFT JOIN working_hour_records whr
                ON whr.company_id = r.company_id
                AND whr.allocation_id = ta.allocation_id
                AND whr.record_status != 'disputed'
                AND whr.work_date >= r.period_start
            GROUP BY
                r.staff_work_rule_id,
                r.company_id,
                r.company_member_id,
                r.max_working_hours,
                r.rule_period,
                r.rule_status;
        """
        row = Database.fetch_one(query, (company_id, company_member_id))

        if row:
            remaining = row.get("remaining_eligible_hours")
            if remaining is None:
                row["eligibility_status"] = None
            elif float(remaining) <= 0:
                row["eligibility_status"] = "at_limit"
            else:
                row["eligibility_status"] = "eligible"

        return row
