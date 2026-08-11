from entity.cancellation_request_entity import CancellationRequestEntity
from entity.dispute_request_entity import DisputeRequestEntity
from entity.staff_profile_entity import StaffProfileEntity
from entity.task_allocation_entity import TaskAllocationEntity
from entity.task_entity import TaskEntity
from entity.work_rule_entity import WorkRuleEntity
from entity.working_hour_entity import WorkingHourEntity

class FullTimeStaffControl:

    @staticmethod
    def view_profile(company_id, company_member_id):
        profile = StaffProfileEntity.get_my_profile(
            company_id=company_id,
            company_member_id=company_member_id
        )

        if not profile:
            return {
                "success": False,
                "message": "Full-Time Staff profile was not found."
            }

        return {
            "success": True,
            "profile": profile
        }

    @staticmethod
    def update_profile(company_id, company_member_id, data):
        # These are the only fields that staff are allowed to update
        allowed_fields = {
            "full_name",
            "phone_number",
            "contact_number",
            "profile_description"
        }

        # Check whether at least one allowed field was provided
        fields_to_update = allowed_fields.intersection(data.keys())

        if not fields_to_update:
            return {
                "success": False,
                "message": "No valid profile fields were provided."
            }

        # Full name should not be empty
        if "full_name" in data and not str(data["full_name"]).strip():
            return {
                "success": False,
                "message": "Full name cannot be empty."
            }

        # Ask the Entity to update the database
        profile = StaffProfileEntity.update_my_profile(
            company_id=company_id,
            company_member_id=company_member_id,
            data=data
        )

        # Return an error if the profile was not found
        if not profile:
            return {
                "success": False,
                "message": "Full-Time Staff profile was not found."
            }

        # Return the updated profile
        return {
            "success": True,
            "message": "Profile updated successfully.",
            "profile": profile
        }

    @staticmethod
    def view_assigned_tasks(company_id, company_member_id):
        # Get this staff member's assigned tasks
        tasks = TaskAllocationEntity.get_assigned_tasks(
            company_id=company_id,
            company_member_id=company_member_id
        )

        # Return the tasks as the staff member's schedule
        return {
            "success": True,
            "tasks": tasks
        }

    @staticmethod
    def view_task_history(company_id, company_member_id):
        # Get the staff member's previous tasks
        history = TaskAllocationEntity.get_task_history(
            company_id=company_id,
            company_member_id=company_member_id
        )

        return {
            "success": True,
            "history": history
        }

    @staticmethod
    def search_assigned_tasks(
        company_id,
        company_member_id,
        search
    ):
        # Do not search if the search value is empty
        if not search or not search.strip():
            return {
                "success": False,
                "message": "Search value is required."
            }

        # Search for tasks belonging to this staff member
        tasks = TaskAllocationEntity.search_assigned_tasks(
            company_id=company_id,
            company_member_id=company_member_id,
            search=search.strip()
        )

        return {
            "success": True,
            "tasks": tasks
        }

    @staticmethod
    def accept_allocation(
        company_id,
        company_member_id,
        allocation_id
    ):
        # Change this staff member's allocation to Accepted
        allocation = TaskAllocationEntity.respond_to_allocation(
            company_id=company_id,
            company_member_id=company_member_id,
            allocation_id=allocation_id,
            allocation_status="accepted"
        )

        # The allocation may not exist or may already be answered
        if not allocation:
            return {
                "success": False,
                "message": (
                    "Allocation was not found or has already "
                    "been answered."
                )
            }

        TaskEntity.update_status(company_id, allocation["task_id"], "allocated")

        return {
            "success": True,
            "message": "Allocation accepted successfully.",
            "allocation": allocation
        }

    @staticmethod
    def decline_allocation(
        company_id,
        company_member_id,
        allocation_id
    ):
        # Change this staff member's allocation to Declined
        allocation = TaskAllocationEntity.respond_to_allocation(
            company_id=company_id,
            company_member_id=company_member_id,
            allocation_id=allocation_id,
            allocation_status="declined"
        )

        # The allocation may not exist or may already be answered
        if not allocation:
            return {
                "success": False,
                "message": (
                    "Allocation was not found or has already "
                    "been answered."
                )
            }

        # Reopen the task so it shows back up as unallocated, not
        # stuck showing "Allocated" with no staff attached
        TaskEntity.update_status(company_id, allocation["task_id"], "open")

        return {
            "success": True,
            "message": "Allocation declined successfully.",
            "allocation": allocation
        }

    @staticmethod
    def complete_task(
        company_id,
        company_member_id,
        allocation_id
    ):
        # Complete an accepted allocation
        allocation = TaskAllocationEntity.complete_allocation(
            company_id=company_id,
            company_member_id=company_member_id,
            allocation_id=allocation_id
        )

        # It cannot be completed if it is not accepted
        if not allocation:
            return {
                "success": False,
                "message": (
                    "Allocation was not found or has not "
                    "been accepted."
                )
            }

        return {
            "success": True,
            "message": "Task marked as completed successfully.",
            "allocation": allocation
        }

    @staticmethod
    def request_cancellation(
        company_id,
        company_member_id,
        allocation_id,
        reason
    ):
        if not reason or not reason.strip():
            return {
                "success": False,
                "message": "Cancellation reason is required."
            }

        cancellation_request = CancellationRequestEntity.create(
            company_id=company_id,
            company_member_id=company_member_id,
            allocation_id=allocation_id,
            reason=reason.strip()
        )

        if not cancellation_request:
            return {
                "success": False,
                "message": (
                    "The allocation was not found, was not accepted, "
                    "or already has a pending cancellation request."
                )
            }

        return {
            "success": True,
            "message": "Cancellation request submitted successfully.",
            "cancellation_request": cancellation_request
        }

    @staticmethod
    def view_cancellation_requests(company_id, company_member_id):
        requests = CancellationRequestEntity.get_by_member(
            company_id=company_id,
            company_member_id=company_member_id
        )

        return {
            "success": True,
            "cancellation_requests": requests
        }

    @staticmethod
    def submit_hours_dispute(
        company_id,
        company_member_id,
        working_hour_id,
        reason,
        requested_hours
    ):
        if not reason or not reason.strip():
            return {
                "success": False,
                "message": "Dispute reason is required."
            }

        try:
            requested_hours = float(requested_hours)
        except (TypeError, ValueError):
            return {
                "success": False,
                "message": "Requested hours must be a number."
            }

        if requested_hours <= 0:
            return {
                "success": False,
                "message": "Requested hours must be greater than zero."
            }

        dispute = DisputeRequestEntity.create(
            company_id=company_id,
            company_member_id=company_member_id,
            working_hour_id=working_hour_id,
            reason=reason.strip(),
            requested_hours=requested_hours
        )

        if not dispute:
            return {
                "success": False,
                "message": (
                    "The working-hour record was not found, "
                    "the requested hours are unchanged, or a "
                    "pending dispute already exists."
                )
            }

        return {
            "success": True,
            "message": "Hours dispute submitted successfully.",
            "dispute": dispute
        }

    @staticmethod
    def view_disputes(company_id, company_member_id):
        disputes = DisputeRequestEntity.get_by_member(
            company_id=company_id,
            company_member_id=company_member_id
        )

        return {
            "success": True,
            "disputes": disputes
        }

    @staticmethod
    def view_working_hours(company_id, company_member_id):
        records = WorkingHourEntity.get_by_member(
            company_id=company_id,
            company_member_id=company_member_id
        )

        return {
            "success": True,
            "working_hours": records
        }

    @staticmethod
    def view_eligibility_hours(company_id, company_member_id):
        work_rule = WorkRuleEntity.get_by_member(
            company_id=company_id,
            company_member_id=company_member_id
        )

        return {
            "success": True,
            "eligibility_hours": {
                "max_working_hours": work_rule.get("max_working_hours"),
                "current_working_hours": work_rule.get("current_working_hours"),
                "remaining_eligible_hours": work_rule.get("remaining_eligible_hours"),
                "eligibility_status": work_rule.get("eligibility_status"),
                "rule_status": work_rule.get("rule_status")
            }
        }