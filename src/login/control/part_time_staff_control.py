from entity.staff_profile_entity import StaffProfileEntity
from entity.availability_entity import AvailabilityEntity
from entity.task_allocation_entity import TaskAllocationEntity
from entity.cancellation_request_entity import CancellationRequestEntity
from entity.work_rule_entity import WorkRuleEntity
from entity.dispute_request_entity import DisputeRequestEntity


class PartTimeStaffControl:

    @staticmethod
    def view_profile(company_id, company_member_id):
        # Get the logged-in staff member's profile
        profile = StaffProfileEntity.get_my_profile(
            company_id=company_id,
            company_member_id=company_member_id
        )

        if not profile:
            return {
                "success": False,
                "message": "Part-Time Staff profile was not found."
            }

        return {
            "success": True,
            "profile": profile
        }

    @staticmethod
    def update_profile(company_id, company_member_id, data):
        # Fields that Part-Time Staff are allowed to update
        allowed_fields = {
            "full_name",
            "phone_number",
            "contact_number",
            "profile_description"
        }

        # Check that the request contains an allowed field
        fields_to_update = allowed_fields.intersection(data.keys())

        if not fields_to_update:
            return {
                "success": False,
                "message": "No valid profile fields were provided."
            }

        # Prevent an empty full name
        if "full_name" in data and not str(data["full_name"]).strip():
            return {
                "success": False,
                "message": "Full name cannot be empty."
            }

        # Update the profile through the Entity
        profile = StaffProfileEntity.update_my_profile(
            company_id=company_id,
            company_member_id=company_member_id,
            data=data
        )

        if not profile:
            return {
                "success": False,
                "message": "Part-Time Staff profile was not found."
            }

        return {
            "success": True,
            "message": "Profile updated successfully.",
            "profile": profile
        }

    @staticmethod
    def update_availability(
        company_id,
        company_member_id,
        availability_id,
        data
    ):
        # Fields that can be changed
        allowed_fields = {
            "available_date",
            "start_time",
            "end_time",
            "availability_status"
        }

        fields_to_update = allowed_fields.intersection(data.keys())

        if not fields_to_update:
            return {
                "success": False,
                "message": "No valid availability fields were provided."
            }

        # Only allow the available or unavailable status
        if data.get("availability_status") not in [
            None,
            "Available",
            "Unavailable"
        ]:
            return {
                "success": False,
                "message": (
                    "Availability status must be "
                    "Available or Unavailable."
                )
            }

        # End time must be later than start time
        if data.get("start_time") and data.get("end_time"):
            if data["start_time"] >= data["end_time"]:
                return {
                    "success": False,
                    "message": "End time must be later than start time."
                }

        schedule = AvailabilityEntity.update_schedule(
            company_id=company_id,
            company_member_id=company_member_id,
            availability_id=availability_id,
            data=data
        )

        if not schedule:
            return {
                "success": False,
                "message": "Availability schedule was not found."
            }

        return {
            "success": True,
            "message": "Availability schedule updated successfully.",
            "availability": schedule
        }

    @staticmethod
    def respond_to_allocation(
        company_id,
        company_member_id,
        allocation_id,
        action
    ):
        # Only accept these two actions
        if action not in ["Accepted", "Declined"]:
            return {
                "success": False,
                "message": "Action must be Accepted or Declined."
            }

        # Update the allocation through the Entity
        allocation = TaskAllocationEntity.respond_to_allocation(
            company_id=company_id,
            company_member_id=company_member_id,
            allocation_id=allocation_id,
            allocation_status=action
        )

        # The allocation must belong to this staff member
        # and must currently have the Assigned status
        if not allocation:
            return {
                "success": False,
                "message": (
                    "Allocation was not found or has already "
                    "been answered."
                )
            }

        return {
            "success": True,
            "message": f"Allocation {action.lower()} successfully.",
            "allocation": allocation
        }

    @staticmethod
    def complete_task(
        company_id,
        company_member_id,
        allocation_id
    ):
        # Mark the accepted allocation as completed
        allocation = TaskAllocationEntity.complete_allocation(
            company_id=company_id,
            company_member_id=company_member_id,
            allocation_id=allocation_id
        )

        # Only an accepted allocation can be completed
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
    def view_current_schedule(company_id, company_member_id):
        # Get the staff member's current and upcoming tasks
        schedule = TaskAllocationEntity.get_assigned_tasks(
            company_id=company_id,
            company_member_id=company_member_id
        )

        return {
            "success": True,
            "schedule": schedule
        }

    @staticmethod
    def view_task_history(company_id, company_member_id):
        # Get the staff member's past and completed tasks
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
        # The search value cannot be empty
        if not search or not search.strip():
            return {
                "success": False,
                "message": "Search value is required."
            }

        # Search only tasks assigned to this staff member
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
    def search_assigned_tasks(
        company_id,
        company_member_id,
        search
    ):
        # The search value cannot be empty
        if not search or not search.strip():
            return {
                "success": False,
                "message": "Search value is required."
            }

        # Search only tasks assigned to this staff member
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
    def request_cancellation(
        company_id,
        company_member_id,
        allocation_id,
        reason
    ):
        # A reason must be provided
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
    def view_eligibility_hours(
        company_id,
        company_member_id
    ):
        # Get the Part-Time Staff member's working-hour rule
        work_rule = WorkRuleEntity.get_by_member(
            company_id=company_id,
            company_member_id=company_member_id
        )

        if not work_rule:
            return {
                "success": False,
                "message": "Working-hour eligibility record was not found."
            }

        return {
            "success": True,
            "eligibility_hours": {
                "max_working_hours": work_rule.get(
                    "max_working_hours"
                ),
                "current_working_hours": work_rule.get(
                    "current_working_hours"
                ),
                "remaining_eligible_hours": work_rule.get(
                    "remaining_eligible_hours"
                ),
                "eligibility_status": work_rule.get(
                    "eligibility_status"
                ),
                "rule_status": work_rule.get("rule_status")
            }
        }

    @staticmethod
    def submit_hours_dispute(
        company_id,
        company_member_id,
        working_hour_id,
        reason,
        requested_hours
    ):
        # A reason must be provided
        if not reason or not reason.strip():
            return {
                "success": False,
                "message": "Dispute reason is required."
            }

        # Requested hours must be a valid positive number
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