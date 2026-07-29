from flask import Blueprint, jsonify, request

from auth_helpers import (
    current_company_id,
    current_company_member_id,
    login_required
)
from control.full_time_staff_control import FullTimeStaffControl


full_time_staff_bp = Blueprint(
    "full_time_staff",
    __name__,
    url_prefix="/api/full-time-staff"
)


@full_time_staff_bp.route("/profile", methods=["GET"])
@login_required("full_time_staff")
def view_profile():
    result = FullTimeStaffControl.view_profile(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 404


# Update the logged-in Full-Time Staff member's profile
@full_time_staff_bp.route("/profile", methods=["PUT", "PATCH"])
@login_required("full_time_staff")
def update_profile():
    # Get the new profile information sent by the frontend
    data = request.get_json() or {}

    # Pass the information to the Control
    result = FullTimeStaffControl.update_profile(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        data=data
    )

    # Return 200 when successful or 400 when unsuccessful
    return jsonify(result), 200 if result["success"] else 400

# View the logged-in Full-Time Staff member's tasks and schedule
@full_time_staff_bp.route("/tasks", methods=["GET"])
@login_required("full_time_staff")
def view_assigned_tasks():
    result = FullTimeStaffControl.view_assigned_tasks(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# View the logged-in staff member's task history
@full_time_staff_bp.route("/tasks/history", methods=["GET"])
@login_required("full_time_staff")
def view_task_history():
    result = FullTimeStaffControl.view_task_history(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# Search the logged-in staff member's assigned tasks
@full_time_staff_bp.route("/tasks/search", methods=["GET"])
@login_required("full_time_staff")
def search_assigned_tasks():
    # Get the search value from the URL
    search = request.args.get("search", "")

    result = FullTimeStaffControl.search_assigned_tasks(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        search=search
    )

    return jsonify(result), 200 if result["success"] else 400

# Accept an allocation belonging to the logged-in staff member
@full_time_staff_bp.route(
    "/allocations/<allocation_id>/accept",
    methods=["PATCH"]
)
@login_required("full_time_staff")
def accept_allocation(allocation_id):
    result = FullTimeStaffControl.accept_allocation(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        allocation_id=allocation_id
    )

    return jsonify(result), 200 if result["success"] else 400

# Decline an allocation belonging to the logged-in staff member
@full_time_staff_bp.route(
    "/allocations/<allocation_id>/decline",
    methods=["PATCH"]
)
@login_required("full_time_staff")
def decline_allocation(allocation_id):
    result = FullTimeStaffControl.decline_allocation(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        allocation_id=allocation_id
    )

    return jsonify(result), 200 if result["success"] else 400

# Mark an accepted task as completed
@full_time_staff_bp.route(
    "/allocations/<allocation_id>/complete",
    methods=["PATCH"]
)
@login_required("full_time_staff")
def complete_task(allocation_id):
    result = FullTimeStaffControl.complete_task(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        allocation_id=allocation_id
    )

    return jsonify(result), 200 if result["success"] else 400