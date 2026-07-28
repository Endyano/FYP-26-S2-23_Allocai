from entity.staff_profile_entity import StaffProfileEntity
from entity.task_allocation_entity import TaskAllocationEntity

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
            allocation_status="Accepted"
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
            allocation_status="Declined"
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