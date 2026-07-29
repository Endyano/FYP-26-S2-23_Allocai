from datetime import date

from entity.audit_log_entity import AuditLogEntity
from entity.company_entity import CompanyEntity
from entity.company_member_entity import CompanyMemberEntity
from entity.invitation_entity import InvitationEntity
from entity.department_entity import DepartmentEntity
from entity.permission_entity import PermissionEntity
from entity.skillset_entity import SkillsetEntity
from entity.role_entity import RoleEntity
from mailer import send_invitation_email

class CompanyAdminControl:

    @staticmethod
    def view_permissions():
        return {
            "success": True,
            "permissions": PermissionEntity.get_all()
        }

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
            "company_address",
            "industry"
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
            "full_time_staff": "full_time",
            "part_time_staff": "part_time"
        }

        invited_role = RoleEntity.get_by_name(
            company_id=company_id,
            role_name=role
        )

        if not invited_role:
            return {
                "success": False,
                "message": "Invalid employee role."
            }

        invitation = InvitationEntity.create(
            company_id=company_id,
            invited_email=email,
            invited_role_id=invited_role["role_id"],
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

        company = CompanyEntity.get_by_id(company_id)

        try:
            send_invitation_email(
                to_email=email,
                company_name=company["company_name"] if company else "your company",
                role_name=role,
                invitation_token=invitation["invitation_token"]
            )
        except Exception:
            invitation["email_sent"] = False
        else:
            invitation["email_sent"] = True

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

    @staticmethod
    def create_skillset(company_id, user_id, data):
        skillset_name = str(
            data.get("skillset_name", "")
        ).strip()

        skillset_description = data.get(
            "skillset_description"
        )

        if not skillset_name:
            return {
                "success": False,
                "message": "Skillset name is required."
            }

        skillset = SkillsetEntity.create(
            company_id=company_id,
            skillset_name=skillset_name,
            skillset_description=skillset_description
        )

        if not skillset:
            return {
                "success": False,
                "message": "Skillset name is already in use."
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="CREATE",
            target_table="skillsets",
            target_record_id=str(skillset["skillset_id"]),
            new_value={
                "skillset_id": str(
                    skillset["skillset_id"]
                ),
                "skillset_name": skillset["skillset_name"],
                "skillset_description": skillset.get(
                    "skillset_description"
                ),
                "skillset_status": skillset[
                    "skillset_status"
                ]
            }
        )

        return {
            "success": True,
            "message": "Skillset created successfully.",
            "skillset": skillset
        }

    @staticmethod
    def view_skillsets(company_id):
        # Get all available company skillsets
        skillsets = SkillsetEntity.get_by_company(
            company_id=company_id
        )

        return {
            "success": True,
            "skillsets": skillsets
        }

    @staticmethod
    def delete_skillset(
        company_id,
        user_id,
        skillset_id
    ):
        # Get the old value for the audit log
        old_skillset = SkillsetEntity.get_by_id(
            company_id=company_id,
            skillset_id=skillset_id
        )

        if not old_skillset:
            return {
                "success": False,
                "message": "Skillset was not found."
            }

        skillset = SkillsetEntity.delete(
            company_id=company_id,
            skillset_id=skillset_id
        )

        if not skillset:
            return {
                "success": False,
                "message": (
                    "Skillset cannot be deleted because it "
                    "is required by an active task."
                )
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="DELETE",
            target_table="skillsets",
            target_record_id=str(skillset_id),
            old_value={
                "skillset_name": old_skillset[
                    "skillset_name"
                ],
                "skillset_description": old_skillset.get(
                    "skillset_description"
                ),
                "skillset_status": old_skillset[
                    "skillset_status"
                ]
            },
            new_value={
                "skillset_status": "Deleted"
            }
        )

        return {
            "success": True,
            "message": "Skillset deleted successfully.",
            "skillset": skillset
        }

    @staticmethod
    def create_role(company_id, user_id, data):
        role_name = str(
            data.get("role_name", "")
        ).strip()

        role_description = data.get("role_description")

        if not role_name:
            return {
                "success": False,
                "message": "Role name is required."
            }

        role = RoleEntity.create(
            company_id=company_id,
            role_name=role_name,
            role_description=role_description
        )

        if not role:
            return {
                "success": False,
                "message": "Role name is already in use."
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="CREATE",
            target_table="roles",
            target_record_id=str(role["role_id"]),
            new_value={
                "role_id": str(role["role_id"]),
                "role_name": role["role_name"],
                "role_description": role.get(
                    "role_description"
                ),
                "is_system_role": role["is_system_role"]
            }
        )

        return {
            "success": True,
            "message": "Access role created successfully.",
            "role": role
        }

    @staticmethod
    def view_roles(company_id):
        # Get company roles and assigned permissions
        roles = RoleEntity.get_by_company(
            company_id=company_id
        )

        return {
            "success": True,
            "roles": roles
        }

    @staticmethod
    def update_role(company_id, user_id, role_id, data):
        allowed_fields = {
            "role_name",
            "role_description",
            "permission_ids"
        }

        if not allowed_fields.intersection(data.keys()):
            return {
                "success": False,
                "message": "No valid role fields were provided."
            }

        if "role_name" in data:
            role_name = str(data["role_name"]).strip()

            if not role_name:
                return {
                    "success": False,
                    "message": "Role name cannot be empty."
                }

            data["role_name"] = role_name

        if "permission_ids" in data:
            if not isinstance(data["permission_ids"], list):
                return {
                    "success": False,
                    "message": "permission_ids must be a list."
                }

            # Remove duplicated permission IDs
            data["permission_ids"] = list(
                dict.fromkeys(data["permission_ids"])
            )

        old_role = RoleEntity.get_by_id(
            company_id=company_id,
            role_id=role_id
        )

        if not old_role:
            return {
                "success": False,
                "message": "Role was not found."
            }

        try:
            role = RoleEntity.update(
                company_id=company_id,
                role_id=role_id,
                data=data
            )
        except ValueError as error:
            return {
                "success": False,
                "message": str(error)
            }

        if not role:
            return {
                "success": False,
                "message": "System roles cannot be updated."
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="UPDATE",
            target_table="roles",
            target_record_id=str(role_id),
            old_value={
                "role_name": old_role["role_name"],
                "role_description": old_role.get(
                    "role_description"
                ),
                "permissions": old_role["permissions"]
            },
            new_value={
                "role_name": role["role_name"],
                "role_description": role.get(
                    "role_description"
                ),
                "permissions": role["permissions"]
            }
        )

        return {
            "success": True,
            "message": "Access role updated successfully.",
            "role": role
        }

    @staticmethod
    def assign_role(
        company_id,
        user_id,
        assigned_by,
        company_member_id,
        role_id
    ):
        if not role_id:
            return {
                "success": False,
                "message": "Role ID is required."
            }

        assignment = RoleEntity.assign_to_member(
            company_id=company_id,
            company_member_id=company_member_id,
            role_id=role_id,
            assigned_by=assigned_by
        )

        if not assignment:
            return {
                "success": False,
                "message": (
                    "The employee or role was not found, "
                    "the employee is inactive, or the role "
                    "is already assigned."
                )
            }

        AuditLogEntity.create(
            company_id=company_id,
            user_id=user_id,
            action_type="ASSIGN_ROLE",
            target_table="member_roles",
            target_record_id=str(company_member_id),
            new_value={
                "company_member_id": str(
                    company_member_id
                ),
                "role_id": str(role_id),
                "assigned_by": str(assigned_by)
            }
        )

        return {
            "success": True,
            "message": "Access role assigned successfully.",
            "role_assignment": assignment
        }