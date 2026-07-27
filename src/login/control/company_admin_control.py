from datetime import date

from entity.audit_log_entity import AuditLogEntity
from entity.company_entity import CompanyEntity
from entity.company_member_entity import CompanyMemberEntity
from entity.invitation_entity import InvitationEntity
from entity.department_entity import DepartmentEntity

class CompanyAdminControl:

    @staticmethod
    def view_company_profile(company_id):
        # Ask the Entity for the company profile
        company = CompanyEntity.get_by_id(company_id)

        if not company:
            return {
                "success": False,
                "message": "Company profile was not found."
            }

        return {
            "success": True,
            "company": company
        }

    @staticmethod
    def update_company_profile(company_id, data):
        # Fields that a Company Admin can update
        allowed_fields = {
            "company_name",
            "company_email",
            "company_phone",
            "company_address"
        }

        fields_to_update = allowed_fields.intersection(data.keys())

        if not fields_to_update:
            return {
                "success": False,
                "message": "No valid company fields were provided."
            }

        # Company name cannot be empty
        if "company_name" in data:
            if not str(data["company_name"]).strip():
                return {
                    "success": False,
                    "message": "Company name cannot be empty."
                }

        # Update the company through the Entity
        company = CompanyEntity.update(
            company_id=company_id,
            data=data
        )

        if not company:
            return {
                "success": False,
                "message": "Company profile was not found."
            }

        return {
            "success": True,
            "message": "Company profile updated successfully.",
            "company": company
        }

    @staticmethod
    def view_employee_accounts(company_id):
        # Get all employee accounts in the company
        employees = CompanyMemberEntity.get_employees_by_company(
            company_id=company_id
        )

        return {
            "success": True,
            "employees": employees
        }

    @staticmethod
    def invite_employee(
        company_id,
        invited_by,
        data
    ):
        email = str(data.get("email", "")).strip().lower()
        role = data.get("role")
        department_id = data.get("department_id")

        if not email or "@" not in email:
            return {
                "success": False,
                "message": "A valid employee email is required."
            }

        allowed_roles = [
            "manager",
            "full_time_staff",
            "part_time_staff"
        ]

        if role not in allowed_roles:
            return {
                "success": False,
                "message": "Invalid employee role."
            }

        # Set employee type based on the selected role
        employee_type_map = {
            "manager": None,
            "full_time_staff": "Full Time",
            "part_time_staff": "Part Time"
        }

        invitation = InvitationEntity.create(
            company_id=company_id,
            invited_email=email,
            invited_role=role,
            employee_type=employee_type_map[role],
            department_id=department_id,
            invited_by=invited_by
        )

        if not invitation:
            return {
                "success": False,
                "message": (
                    "The employee already belongs to the company, "
                    "has a pending invitation, or the department "
                    "is invalid."
                )
            }

        return {
            "success": True,
            "message": "Employee invitation created successfully.",
            "invitation": invitation
        }

    @staticmethod
    def suspend_employee(company_id, company_member_id):
        # Suspend the employee through the Entity
        employee = CompanyMemberEntity.suspend_employee(
            company_id=company_id,
            company_member_id=company_member_id
        )

        if not employee:
            return {
                "success": False,
                "message": (
                    "Employee was not found, already suspended, "
                    "or cannot be suspended."
                )
            }

        return {
            "success": True,
            "message": "Employee account suspended successfully.",
            "employee": employee
        }

    @staticmethod
    def remove_employee(company_id, company_member_id):
        # Remove the employee through the Entity
        employee = CompanyMemberEntity.remove_employee(
            company_id=company_id,
            company_member_id=company_member_id
        )

        if not employee:
            return {
                "success": False,
                "message": (
                    "Employee was not found, was already removed, "
                    "or cannot be removed."
                )
            }

        return {
            "success": True,
            "message": "Employee removed from the company successfully.",
            "employee": employee
        }

    @staticmethod
    def view_audit_logs(
        company_id,
        user_id=None,
        start_date=None,
        end_date=None
    ):
        # Check that the date values are valid
        try:
            parsed_start = (
                date.fromisoformat(start_date)
                if start_date
                else None
            )
            parsed_end = (
                date.fromisoformat(end_date)
                if end_date
                else None
            )
        except ValueError:
            return {
                "success": False,
                "message": "Dates must use the YYYY-MM-DD format."
            }

        # Start date cannot be later than end date
        if parsed_start and parsed_end:
            if parsed_start > parsed_end:
                return {
                    "success": False,
                    "message": (
                        "Start date cannot be later than end date."
                    )
                }

        logs = AuditLogEntity.get_by_company(
            company_id=company_id,
            user_id=user_id,
            start_date=start_date,
            end_date=end_date
        )

        return {
            "success": True,
            "audit_logs": logs
        }

    @staticmethod
    def create_department(company_id, user_id, data):
        department_name = str(
            data.get("department_name", "")
        ).strip()

        department_description = data.get(
            "department_description"
        )

        if not department_name:
            return {
                "success": False,
                "message": "Department name is required."
            }

        # Create the department through the Entity
        department = DepartmentEntity.create(
            company_id=company_id,
            department_name=department_name,
            department_description=department_description
        )

        if not department:
            return {
                "success": False,
                "message": "Department name is already in use."
            }

        # Record the administrative change
        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="CREATE",
            target_table="departments",
            target_record_id=str(
                department["department_id"]
            ),
            new_value={
                "department_id": str(
                    department["department_id"]
                ),
                "department_name": department[
                    "department_name"
                ],
                "department_description": department.get(
                    "department_description"
                ),
                "department_status": department[
                    "department_status"
                ]
            }
        )

        return {
            "success": True,
            "message": "Department created successfully.",
            "department": department
        }

    @staticmethod
    def view_departments(company_id):
        # Get the company's departments
        departments = DepartmentEntity.get_by_company(
            company_id=company_id
        )

        return {
            "success": True,
            "departments": departments
        }

    @staticmethod
    def update_department(
        company_id,
        user_id,
        department_id,
        data
    ):
        allowed_fields = {
            "department_name",
            "department_description",
            "department_status"
        }

        fields_to_update = allowed_fields.intersection(data.keys())

        if not fields_to_update:
            return {
                "success": False,
                "message": "No valid department fields were provided."
            }

        if "department_name" in data:
            department_name = str(
                data["department_name"]
            ).strip()

            if not department_name:
                return {
                    "success": False,
                    "message": "Department name cannot be empty."
                }

            data["department_name"] = department_name

        if data.get("department_status") not in [
            None,
            "Active",
            "Inactive"
        ]:
            return {
                "success": False,
                "message": (
                    "Department status must be Active or Inactive."
                )
            }

        # Save the old value for the audit log
        old_department = DepartmentEntity.get_by_id(
            company_id=company_id,
            department_id=department_id
        )

        if not old_department:
            return {
                "success": False,
                "message": "Department was not found."
            }

        department = DepartmentEntity.update(
            company_id=company_id,
            department_id=department_id,
            data=data
        )

        if not department:
            return {
                "success": False,
                "message": (
                    "Department could not be updated. "
                    "The name may already be in use."
                )
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="UPDATE",
            target_table="departments",
            target_record_id=str(department_id),
            old_value={
                "department_name": old_department[
                    "department_name"
                ],
                "department_description": old_department.get(
                    "department_description"
                ),
                "department_status": old_department[
                    "department_status"
                ]
            },
            new_value={
                "department_name": department[
                    "department_name"
                ],
                "department_description": department.get(
                    "department_description"
                ),
                "department_status": department[
                    "department_status"
                ]
            }
        )

        return {
            "success": True,
            "message": "Department updated successfully.",
            "department": department
        }

    @staticmethod
    def delete_department(
        company_id,
        user_id,
        department_id
    ):
        # Save the existing value for the audit log
        old_department = DepartmentEntity.get_by_id(
            company_id=company_id,
            department_id=department_id
        )

        if not old_department:
            return {
                "success": False,
                "message": "Department was not found."
            }

        department = DepartmentEntity.delete(
            company_id=company_id,
            department_id=department_id
        )

        if not department:
            return {
                "success": False,
                "message": (
                    "Department cannot be deleted because it "
                    "has active tasks."
                )
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="DELETE",
            target_table="departments",
            target_record_id=str(department_id),
            old_value={
                "department_name": old_department[
                    "department_name"
                ],
                "department_description": old_department.get(
                    "department_description"
                ),
                "department_status": old_department[
                    "department_status"
                ]
            },
            new_value={
                "department_status": "Deleted"
            }
        )

        return {
            "success": True,
            "message": "Department deleted successfully.",
            "department": department
        }