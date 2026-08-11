from entity.availability_entity import AvailabilityEntity
from entity.cancellation_request_entity import CancellationRequestEntity
from entity.department_entity import DepartmentEntity
from entity.dispute_request_entity import DisputeRequestEntity
from entity.skillset_entity import SkillsetEntity
from entity.staff_profile_entity import StaffProfileEntity
from entity.task_allocation_entity import TaskAllocationEntity
from entity.task_entity import TaskEntity
from entity.working_hour_entity import WorkingHourEntity
from entity.work_rule_entity import WorkRuleEntity


class ManagerControl:

    @staticmethod
    def view_departments(company_id):
        return {
            "success": True,
            "departments": DepartmentEntity.get_by_company(company_id)
        }

    @staticmethod
    def view_skillsets(company_id):
        return {
            "success": True,
            "skillsets": SkillsetEntity.get_by_company(company_id)
        }

    @staticmethod
    def view_staff_skillset_assignments(company_id):
        return {
            "success": True,
            "assignments": SkillsetEntity.get_staff_assignments_by_company(company_id)
        }

    @staticmethod
    def view_staff(company_id, search=None, skillset_id=None, availability_date=None):
        staff = StaffProfileEntity.get_staff(
            company_id=company_id,
            search=search,
            skillset_id=skillset_id,
            availability_date=availability_date
        )

        return {
            "success": True,
            "staff": staff
        }

    VALID_RULE_PERIODS = {"weekly", "fortnightly", "monthly"}

    @staticmethod
    def _validate_work_rule_input(max_working_hours, rule_period):
        if max_working_hours is None or float(max_working_hours) <= 0:
            return "A positive hour limit is required."

        if rule_period not in ManagerControl.VALID_RULE_PERIODS:
            return "Rule period must be weekly, fortnightly, or monthly."

        return None

    @staticmethod
    def propose_work_rule(company_id, company_member_id, requested_by, max_working_hours, rule_period, rule_notes=None):
        error = ManagerControl._validate_work_rule_input(max_working_hours, rule_period)
        if error:
            return {"success": False, "message": error}

        rule = WorkRuleEntity.propose(
            company_id=company_id,
            company_member_id=company_member_id,
            requested_by=requested_by,
            max_working_hours=max_working_hours,
            rule_period=rule_period,
            rule_notes=rule_notes
        )

        return {
            "success": True,
            "message": "Hour limit submitted for admin approval.",
            "work_rule": rule
        }

    @staticmethod
    def override_work_rule(company_id, company_member_id, requested_by, max_working_hours, rule_period, rule_notes=None):
        error = ManagerControl._validate_work_rule_input(max_working_hours, rule_period)
        if error:
            return {"success": False, "message": error}

        if not rule_notes or not rule_notes.strip():
            return {
                "success": False,
                "message": "A reason is required for an override (e.g. approved overtime)."
            }

        rule = WorkRuleEntity.create_override(
            company_id=company_id,
            company_member_id=company_member_id,
            requested_by=requested_by,
            max_working_hours=max_working_hours,
            rule_period=rule_period,
            rule_notes=rule_notes.strip()
        )

        return {
            "success": True,
            "message": "Hour limit overridden immediately.",
            "work_rule": rule
        }

    @staticmethod
    def assign_skillset(company_id, company_member_id, skillset_id, assigned_by):
        if not skillset_id:
            return {
                "success": False,
                "message": "Skillset is required."
            }

        skillset = SkillsetEntity.get_by_id(company_id, skillset_id)

        if not skillset:
            return {
                "success": False,
                "message": "Skillset was not found."
            }

        if SkillsetEntity.staff_has_skillset(company_id, company_member_id, skillset_id):
            return {
                "success": False,
                "message": "This staff member already has that skillset."
            }

        result = SkillsetEntity.assign_to_staff(
            company_id=company_id,
            company_member_id=company_member_id,
            skillset_id=skillset_id,
            assigned_by=assigned_by
        )

        return {
            "success": True,
            "message": "Skillset assigned successfully.",
            "staff_skillset": result
        }

    @staticmethod
    def update_staff_skillset(company_id, staff_skillset_id, skillset_id):
        if not skillset_id:
            return {
                "success": False,
                "message": "Skillset is required."
            }

        result = SkillsetEntity.update_staff_skillset(
            company_id=company_id,
            staff_skillset_id=staff_skillset_id,
            skillset_id=skillset_id
        )

        if not result:
            return {
                "success": False,
                "message": "Staff skillset record was not found."
            }

        return {
            "success": True,
            "message": "Skillset updated successfully.",
            "staff_skillset": result
        }

    @staticmethod
    def create_task(company_id, created_by, data):
        required_fields = [
            "department_id",
            "task_title",
            "task_date",
            "start_time",
            "end_time",
            "priority_level"
        ]

        for field in required_fields:
            if not data.get(field):
                return {
                    "success": False,
                    "message": f"{field} is required."
                }

        task = TaskEntity.create(
            company_id=company_id,
            department_id=data.get("department_id"),
            created_by=created_by,
            task_title=data.get("task_title"),
            task_description=data.get("task_description"),
            required_skillset_id=data.get("required_skillset_id"),
            task_date=data.get("task_date"),
            start_time=data.get("start_time"),
            end_time=data.get("end_time"),
            priority_level=data.get("priority_level"),
            origin=data.get("origin") or "manual",
            source_text=data.get("source_text")
        )

        return {
            "success": True,
            "message": "Task request created successfully.",
            "task": task
        }

    @staticmethod
    def view_tasks(company_id, status=None):
        return {
            "success": True,
            "tasks": TaskEntity.get_by_company(company_id, status)
        }

    @staticmethod
    def update_task(company_id, task_id, data):
        task = TaskEntity.update(company_id, task_id, data)

        if not task:
            return {
                "success": False,
                "message": "Task request was not found."
            }

        return {
            "success": True,
            "message": "Task request updated successfully.",
            "task": task
        }

    @staticmethod
    def cancel_task(company_id, task_id, reason=None):
        task = TaskEntity.cancel(company_id, task_id)

        if not task:
            return {
                "success": False,
                "message": "Task request was not found."
            }

        TaskAllocationEntity.cancel_by_task(company_id, task_id)

        return {
            "success": True,
            "message": "Task request cancelled successfully.",
            "task": task
        }

    @staticmethod
    def assign_task(company_id, task_id, assigned_to, assigned_by):
        if not assigned_to:
            return {
                "success": False,
                "message": "Assigned staff member is required."
            }

        task = TaskEntity.get_by_id(company_id, task_id)

        if not task:
            return {
                "success": False,
                "message": "Task request was not found."
            }

        eligibility = ManagerControl.check_staff_eligibility(company_id, assigned_to, task)

        if not eligibility["eligible"]:
            return {
                "success": False,
                "message": eligibility["message"]
            }

        allocation = TaskAllocationEntity.create(
            company_id=company_id,
            task_id=task_id,
            assigned_to=assigned_to,
            assigned_by=assigned_by
        )

        TaskEntity.update_status(company_id, task_id, "pending")

        return {
            "success": True,
            "message": "Task assigned successfully.",
            "allocation": allocation
        }

    @staticmethod
    def check_staff_eligibility(company_id, company_member_id, task):
        staff = StaffProfileEntity.get_by_member_id(company_id, company_member_id)

        if not staff:
            return {
                "eligible": False,
                "message": "Staff member was not found."
            }

        if staff.get("profile_status") != "Active":
            return {
                "eligible": False,
                "message": "Staff profile is not active."
            }

        if staff.get("employee_type") == "part_time":
            rule = WorkRuleEntity.get_by_member(company_id, company_member_id)
            task_hours = TaskEntity.calculate_task_hours(
                task["start_time"],
                task["end_time"]
            )

            if rule and rule.get("remaining_eligible_hours") is not None:
                if float(rule["remaining_eligible_hours"]) < task_hours:
                    return {
                        "eligible": False,
                        "message": "Staff member does not have enough remaining eligible hours."
                    }

        if task.get("required_skillset_id"):
            has_skill = SkillsetEntity.staff_has_skillset(
                company_id=company_id,
                company_member_id=company_member_id,
                skillset_id=task["required_skillset_id"]
            )

            if not has_skill:
                return {
                    "eligible": False,
                    "message": "Staff member does not have the required skillset."
                }

        available = AvailabilityEntity.is_available_for_task(
            company_id=company_id,
            company_member_id=company_member_id,
            task_date=task["task_date"],
            start_time=task["start_time"],
            end_time=task["end_time"]
        )

        if available is False:
            return {
                "eligible": False,
                "message": "Staff member is not available for this task time."
            }

        has_conflict = TaskAllocationEntity.has_time_conflict(
            company_id=company_id,
            company_member_id=company_member_id,
            task_date=task["task_date"],
            start_time=task["start_time"],
            end_time=task["end_time"]
        )

        if has_conflict:
            return {
                "eligible": False,
                "message": "Staff member already has another task during this time."
            }

        return {
            "eligible": True,
            "message": "Staff member is eligible."
        }

    @staticmethod
    def get_allocation_status(company_id):
        return {
            "success": True,
            "allocation_status": TaskAllocationEntity.get_status_summary(company_id)
        }

    @staticmethod
    def get_allocation_suggestions(company_id, task_id):
        task = TaskEntity.get_by_id(company_id, task_id)

        if not task:
            return {
                "success": False,
                "message": "Task request was not found."
            }

        # Don't pre-filter by availability here: that requires an explicit
        # 'available' record for the exact date, which excludes full-time
        # staff (who never track availability) and any part-time staff who
        # simply haven't logged a day yet. check_staff_eligibility below
        # already does the correct, permissive availability check per
        # candidate (no record = not disqualified, only an explicit
        # 'unavailable' record is).
        candidates = StaffProfileEntity.get_staff(
            company_id=company_id,
            skillset_id=task.get("required_skillset_id")
        )

        suggestions = []

        for candidate in candidates:
            eligibility = ManagerControl.check_staff_eligibility(
                company_id,
                candidate["company_member_id"],
                task
            )

            if eligibility["eligible"]:
                suggestions.append(candidate)

        return {
            "success": True,
            "message": "Allocation suggestions generated.",
            "suggestions": suggestions[:5]
        }

    @staticmethod
    def get_disputes(company_id):
        return {
            "success": True,
            "disputes": DisputeRequestEntity.get_pending_by_company(company_id)
        }

    @staticmethod
    def resolve_dispute(company_id, dispute_request_id, action, reviewed_by, manager_note=None):
        if action not in ["approved", "rejected"]:
            return {
                "success": False,
                "message": "Action must be approved or rejected."
            }

        dispute = DisputeRequestEntity.resolve(
            company_id=company_id,
            dispute_request_id=dispute_request_id,
            status=action,
            reviewed_by=reviewed_by,
            manager_note=manager_note
        )

        if not dispute:
            return {
                "success": False,
                "message": "Dispute request was not found."
            }

        if action == "approved" and dispute.get("working_hour_id"):
            WorkingHourEntity.update_hours(
                company_id=company_id,
                working_hour_id=dispute["working_hour_id"],
                hours_worked=dispute["requested_hours"]
            )

        return {
            "success": True,
            "message": f"Dispute {action.lower()} successfully.",
            "dispute": dispute
        }

    @staticmethod
    def get_cancellation_requests(company_id):
        return {
            "success": True,
            "cancellation_requests": CancellationRequestEntity.get_pending_by_company(company_id)
        }

    @staticmethod
    def resolve_cancellation_request(company_id, cancellation_request_id, action, reviewed_by):
        if action not in ["approved", "rejected"]:
            return {
                "success": False,
                "message": "Action must be approved or rejected."
            }

        request = CancellationRequestEntity.resolve(
            company_id=company_id,
            cancellation_request_id=cancellation_request_id,
            status=action,
            reviewed_by=reviewed_by
        )

        if not request:
            return {
                "success": False,
                "message": "Cancellation request was not found."
            }

        if action == "approved":
            TaskAllocationEntity.update_status(
                company_id=company_id,
                allocation_id=request["allocation_id"],
                allocation_status="cancelled"
            )

            TaskEntity.update_status(
                company_id=company_id,
                task_id=request["task_id"],
                task_status="cancelled"
            )

        return {
            "success": True,
            "message": f"Cancellation request {action.lower()} successfully.",
            "request": request
        }