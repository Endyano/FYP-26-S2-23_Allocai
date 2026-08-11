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
            WITH base AS (
                SELECT %s::uuid AS company_id, %s::uuid AS company_member_id
            ),
            rule AS (
                SELECT
                    staff_work_rule_id,
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
                b.company_id,
                b.company_member_id,
                r.max_working_hours,
                r.rule_period,
                r.rule_status,
                COALESCE(SUM(whr.hours_worked), 0) AS current_working_hours,
                CASE
                    WHEN r.max_working_hours IS NOT NULL
                        THEN r.max_working_hours - COALESCE(SUM(whr.hours_worked), 0)
                    ELSE NULL
                END AS remaining_eligible_hours
            FROM base b
            LEFT JOIN rule r ON true
            LEFT JOIN task_allocations ta
                ON ta.company_id = b.company_id
                AND ta.assigned_to = b.company_member_id
            LEFT JOIN working_hour_records whr
                ON whr.company_id = b.company_id
                AND whr.allocation_id = ta.allocation_id
                AND whr.record_status != 'disputed'
                AND (r.period_start IS NULL OR whr.work_date >= r.period_start)
            GROUP BY
                r.staff_work_rule_id,
                b.company_id,
                b.company_member_id,
                r.max_working_hours,
                r.rule_period,
                r.rule_status;
        """
        row = Database.fetch_one(query, (company_id, company_member_id, company_id, company_member_id))

        if row:
            remaining = row.get("remaining_eligible_hours")
            if remaining is None:
                row["eligibility_status"] = None
            elif float(remaining) <= 0:
                row["eligibility_status"] = "at_limit"
            else:
                row["eligibility_status"] = "eligible"

        return row

    # A staff member has at most one work-rule row (unique on company_member_id).
    # A pending proposal is staged in the proposed_* columns so it never
    # overwrites the currently active limit until an admin approves it.

    @staticmethod
    def propose(company_id, company_member_id, requested_by, max_working_hours, rule_period, rule_notes):
        query = """
            INSERT INTO staff_work_rules (
                company_id, company_member_id, max_working_hours, rule_period,
                rule_status, requested_by, is_override,
                proposed_max_working_hours, proposed_rule_period, proposed_notes, proposal_status
            )
            VALUES (%s, %s, %s, %s, 'Pending', %s, false, %s, %s, %s, 'pending')
            ON CONFLICT (company_member_id) DO UPDATE SET
                proposed_max_working_hours = EXCLUDED.proposed_max_working_hours,
                proposed_rule_period = EXCLUDED.proposed_rule_period,
                proposed_notes = EXCLUDED.proposed_notes,
                proposal_status = 'pending',
                requested_by = EXCLUDED.requested_by,
                reviewed_by = NULL,
                reviewed_at = NULL,
                updated_at = now()
            RETURNING *;
        """
        return Database.execute(query, (
            company_id, company_member_id, max_working_hours, rule_period,
            requested_by, max_working_hours, rule_period, rule_notes
        ))

    @staticmethod
    def create_override(company_id, company_member_id, requested_by, max_working_hours, rule_period, rule_notes):
        query = """
            INSERT INTO staff_work_rules (
                company_id, company_member_id, max_working_hours, rule_period, rule_notes,
                rule_status, requested_by, is_override, reviewed_by, reviewed_at
            )
            VALUES (%s, %s, %s, %s, %s, 'Active', %s, true, %s, now())
            ON CONFLICT (company_member_id) DO UPDATE SET
                max_working_hours = EXCLUDED.max_working_hours,
                rule_period = EXCLUDED.rule_period,
                rule_notes = EXCLUDED.rule_notes,
                rule_status = 'Active',
                is_override = true,
                requested_by = EXCLUDED.requested_by,
                reviewed_by = EXCLUDED.reviewed_by,
                reviewed_at = now(),
                proposed_max_working_hours = NULL,
                proposed_rule_period = NULL,
                proposed_notes = NULL,
                proposal_status = NULL,
                updated_at = now()
            RETURNING *;
        """
        return Database.execute(query, (
            company_id, company_member_id, max_working_hours, rule_period,
            rule_notes, requested_by, requested_by
        ))

    @staticmethod
    def get_pending_by_company(company_id):
        # Includes pending proposals plus recently-decided ones (approved/
        # rejected), so a decision stays visible in the approvals table
        # instead of disappearing the moment it's actioned. A staff
        # member's decided proposal is replaced the next time a new one
        # is submitted for them (see propose()'s ON CONFLICT clause).
        query = """
            SELECT
                swr.staff_work_rule_id,
                swr.company_member_id,
                swr.proposal_status,
                CASE WHEN swr.rule_status = 'Active' THEN swr.max_working_hours ELSE NULL END AS current_max_working_hours,
                CASE WHEN swr.rule_status = 'Active' THEN swr.rule_period ELSE NULL END AS current_rule_period,
                swr.proposed_max_working_hours,
                swr.proposed_rule_period,
                swr.proposed_notes,
                swr.updated_at,
                u.full_name AS staff_name,
                sp.employee_type,
                mu.full_name AS requested_by_name,
                ru.full_name AS reviewed_by_name
            FROM staff_work_rules swr
            JOIN company_members cm ON cm.company_member_id = swr.company_member_id
            JOIN users u ON u.user_id = cm.user_id
            LEFT JOIN staff_profiles sp
                ON sp.company_member_id = swr.company_member_id
                AND sp.company_id = swr.company_id
            LEFT JOIN company_members rcm ON rcm.company_member_id = swr.requested_by
            LEFT JOIN users mu ON mu.user_id = rcm.user_id
            LEFT JOIN company_members rvcm ON rvcm.company_member_id = swr.reviewed_by
            LEFT JOIN users ru ON ru.user_id = rvcm.user_id
            WHERE swr.company_id = %s
            AND swr.proposal_status IN ('pending', 'approved', 'rejected')
            ORDER BY
                CASE WHEN swr.proposal_status = 'pending' THEN 0 ELSE 1 END,
                swr.updated_at DESC;
        """
        return Database.fetch_all(query, (company_id,))

    @staticmethod
    def approve(company_id, staff_work_rule_id, reviewed_by):
        # Keep the proposed_* values and mark the proposal 'approved'
        # (instead of clearing it to NULL) so the decision stays visible
        # in the approvals table until a new proposal is made for this
        # staff member.
        query = """
            UPDATE staff_work_rules
            SET max_working_hours = proposed_max_working_hours,
                rule_period = proposed_rule_period,
                rule_notes = proposed_notes,
                rule_status = 'Active',
                is_override = false,
                reviewed_by = %s,
                reviewed_at = now(),
                updated_at = now(),
                proposal_status = 'approved'
            WHERE company_id = %s AND staff_work_rule_id = %s AND proposal_status = 'pending'
            RETURNING *;
        """
        return Database.execute(query, (reviewed_by, company_id, staff_work_rule_id))

    @staticmethod
    def reject(company_id, staff_work_rule_id, reviewed_by):
        # Keep the proposed_* values and mark the proposal 'rejected'
        # (instead of clearing it to NULL) so the decision stays visible
        # in the approvals table until a new proposal is made for this
        # staff member.
        query = """
            UPDATE staff_work_rules
            SET proposal_status = 'rejected',
                reviewed_by = %s,
                reviewed_at = now(),
                updated_at = now()
            WHERE company_id = %s AND staff_work_rule_id = %s AND proposal_status = 'pending'
            RETURNING *;
        """
        return Database.execute(query, (reviewed_by, company_id, staff_work_rule_id))
