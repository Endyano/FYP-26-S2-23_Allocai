from flask import Blueprint, jsonify, request

from auth_helpers import (
    current_company_id,
    current_company_member_id,
    current_user_id,
    login_required
)
from control.company_admin_control import CompanyAdminControl


# Group all Company Admin API routes
company_admin_bp = Blueprint(
    "company_admin",
    __name__,
    url_prefix="/api/company-admin"
)

# View the logged-in admin's company profile
@company_admin_bp.route("/company-profile", methods=["GET"])
@login_required("company_admin")
def view_company_profile():
    result = CompanyAdminControl.view_company_profile(
        company_id=current_company_id()
    )

    return jsonify(result), 200 if result["success"] else 404

# Update the logged-in admin's company profile
@company_admin_bp.route(
    "/company-profile",
    methods=["PUT", "PATCH"]
)
@login_required("company_admin")
def update_company_profile():
    data = request.get_json() or {}

    result = CompanyAdminControl.update_company_profile(
        company_id=current_company_id(),
        data=data
    )

    return jsonify(result), 200 if result["success"] else 400

# View employee accounts in the company
@company_admin_bp.route("/employees", methods=["GET"])
@login_required("company_admin")
def view_employee_accounts():
    result = CompanyAdminControl.view_employee_accounts(
        company_id=current_company_id()
    )

    return jsonify(result), 200

# Invite an employee to the company
@company_admin_bp.route("/employees/invite", methods=["POST"])
@login_required("company_admin")
def invite_employee():
    data = request.get_json() or {}

    result = CompanyAdminControl.invite_employee(
        company_id=current_company_id(),
        invited_by=current_company_member_id(),
        data=data
    )

    return jsonify(result), 201 if result["success"] else 400

# Suspend an employee from the company workspace
@company_admin_bp.route(
    "/employees/<company_member_id>/suspend",
    methods=["PATCH"]
)
@login_required("company_admin")
def suspend_employee(company_member_id):
    result = CompanyAdminControl.suspend_employee(
        company_id=current_company_id(),
        company_member_id=company_member_id
    )

    return jsonify(result), 200 if result["success"] else 400

# Remove an employee from the company workspace
@company_admin_bp.route(
    "/employees/<company_member_id>",
    methods=["DELETE"]
)
@login_required("company_admin")
def remove_employee(company_member_id):
    result = CompanyAdminControl.remove_employee(
        company_id=current_company_id(),
        company_member_id=company_member_id
    )

    return jsonify(result), 200 if result["success"] else 400

# View and filter the company's system change history
@company_admin_bp.route("/audit-logs", methods=["GET"])
@login_required("company_admin")
def view_audit_logs():
    result = CompanyAdminControl.view_audit_logs(
        company_id=current_company_id(),
        user_id=request.args.get("user_id"),
        start_date=request.args.get("start_date"),
        end_date=request.args.get("end_date")
    )

    return jsonify(result), 200 if result["success"] else 400

# Create a department in the company
@company_admin_bp.route("/departments", methods=["POST"])
@login_required("company_admin")
def create_department():
    data = request.get_json() or {}

    result = CompanyAdminControl.create_department(
        company_id=current_company_id(),
        user_id=current_user_id(),
        data=data
    )

    return jsonify(result), 201 if result["success"] else 400

# View departments in the company
@company_admin_bp.route("/departments", methods=["GET"])
@login_required("company_admin")
def view_departments():
    result = CompanyAdminControl.view_departments(
        company_id=current_company_id()
    )

    return jsonify(result), 200

# Update a department
@company_admin_bp.route(
    "/departments/<department_id>",
    methods=["PUT", "PATCH"]
)
@login_required("company_admin")
def update_department(department_id):
    data = request.get_json() or {}

    result = CompanyAdminControl.update_department(
        company_id=current_company_id(),
        user_id=current_user_id(),
        department_id=department_id,
        data=data
    )

    return jsonify(result), 200 if result["success"] else 400

# Delete a department
@company_admin_bp.route(
    "/departments/<department_id>",
    methods=["DELETE"]
)
@login_required("company_admin")
def delete_department(department_id):
    result = CompanyAdminControl.delete_department(
        company_id=current_company_id(),
        user_id=current_user_id(),
        department_id=department_id
    )

    return jsonify(result), 200 if result["success"] else 400