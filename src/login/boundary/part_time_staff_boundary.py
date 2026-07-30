from flask import Blueprint, jsonify, request

from auth_helpers import (
    current_company_id,
    current_company_member_id,
    login_required
)
from control.part_time_staff_control import PartTimeStaffControl


# Group all Part-Time Staff API routes
part_time_staff_bp = Blueprint(
    "part_time_staff",
    __name__,
    url_prefix="/api/part-time-staff"
)
# View the logged-in Part-Time Staff member's profile
@part_time_staff_bp.route("/profile", methods=["GET"])
@login_required("part_time_staff")
def view_profile():
    result = PartTimeStaffControl.view_profile(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 404

# Update the logged-in Part-Time Staff member's profile
@part_time_staff_bp.route("/profile", methods=["PUT", "PATCH"])
@login_required("part_time_staff")
def update_profile():
    # Get the information sent by the frontend
    data = request.get_json() or {}

    result = PartTimeStaffControl.update_profile(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        data=data
    )

    return jsonify(result), 200 if result["success"] else 400

# View the logged-in staff member's availability slots
@part_time_staff_bp.route("/availability", methods=["GET"])
@login_required("part_time_staff")
def view_availability():
    result = PartTimeStaffControl.view_availability(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# Add a new availability slot for the logged-in staff member
@part_time_staff_bp.route("/availability", methods=["POST"])
@login_required("part_time_staff")
def create_availability():
    data = request.get_json() or {}

    result = PartTimeStaffControl.create_availability(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        available_date=data.get("available_date"),
        start_time=data.get("start_time"),
        end_time=data.get("end_time"),
        availability_status=data.get("availability_status", "available")
    )

    return jsonify(result), 201 if result["success"] else 400

# Update the logged-in staff member's availability
@part_time_staff_bp.route(
    "/availability/<availability_id>",
    methods=["PUT", "PATCH"]
)
@login_required("part_time_staff")
def update_availability(availability_id):
    data = request.get_json() or {}

    result = PartTimeStaffControl.update_availability(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        availability_id=availability_id,
        data=data
    )

    return jsonify(result), 200 if result["success"] else 400

# Remove an availability slot for the logged-in staff member
@part_time_staff_bp.route(
    "/availability/<availability_id>",
    methods=["DELETE"]
)
@login_required("part_time_staff")
def delete_availability(availability_id):
    result = PartTimeStaffControl.delete_availability(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        availability_id=availability_id
    )

    return jsonify(result), 200 if result["success"] else 400

# Accept or decline an allocation
@part_time_staff_bp.route(
    "/allocations/<allocation_id>/respond",
    methods=["PATCH"]
)
@login_required("part_time_staff")
def respond_to_allocation(allocation_id):
    data = request.get_json() or {}

    result = PartTimeStaffControl.respond_to_allocation(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        allocation_id=allocation_id,
        action=data.get("action")
    )

    return jsonify(result), 200 if result["success"] else 400

# Mark an accepted allocation as completed
@part_time_staff_bp.route(
    "/allocations/<allocation_id>/complete",
    methods=["PATCH"]
)
@login_required("part_time_staff")
def complete_task(allocation_id):
    result = PartTimeStaffControl.complete_task(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        allocation_id=allocation_id
    )

    return jsonify(result), 200 if result["success"] else 400

# View current and upcoming tasks
@part_time_staff_bp.route("/schedule", methods=["GET"])
@login_required("part_time_staff")
def view_current_schedule():
    result = PartTimeStaffControl.view_current_schedule(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# View the logged-in staff member's task history
@part_time_staff_bp.route("/tasks/history", methods=["GET"])
@login_required("part_time_staff")
def view_task_history():
    result = PartTimeStaffControl.view_task_history(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# Search tasks assigned to the logged-in staff member
@part_time_staff_bp.route("/tasks/search", methods=["GET"])
@login_required("part_time_staff")
def search_assigned_tasks():
    # Read the search value from the URL
    search = request.args.get("search", "")

    result = PartTimeStaffControl.search_assigned_tasks(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        search=search
    )

    return jsonify(result), 200 if result["success"] else 400

# Request cancellation of an accepted task allocation
@part_time_staff_bp.route(
    "/allocations/<allocation_id>/cancellation-request",
    methods=["POST"]
)
@login_required("part_time_staff")
def request_cancellation(allocation_id):
    data = request.get_json() or {}

    result = PartTimeStaffControl.request_cancellation(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        allocation_id=allocation_id,
        reason=data.get("reason")
    )

    return jsonify(result), 201 if result["success"] else 400

# View the logged-in staff member's own cancellation requests
@part_time_staff_bp.route("/cancellation-requests", methods=["GET"])
@login_required("part_time_staff")
def view_cancellation_requests():
    result = PartTimeStaffControl.view_cancellation_requests(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# View the logged-in staff member's eligibility hours
@part_time_staff_bp.route(
    "/eligibility-hours",
    methods=["GET"]
)
@login_required("part_time_staff")
def view_eligibility_hours():
    result = PartTimeStaffControl.view_eligibility_hours(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 404

# Submit a dispute for a working-hour record
@part_time_staff_bp.route(
    "/working-hours/<working_hour_id>/disputes",
    methods=["POST"]
)
@login_required("part_time_staff")
def submit_hours_dispute(working_hour_id):
    data = request.get_json() or {}

    result = PartTimeStaffControl.submit_hours_dispute(
        company_id=current_company_id(),
        company_member_id=current_company_member_id(),
        working_hour_id=working_hour_id,
        reason=data.get("reason"),
        requested_hours=data.get("requested_hours")
    )

    return jsonify(result), 201 if result["success"] else 400

# View the logged-in staff member's own dispute requests
@part_time_staff_bp.route("/disputes", methods=["GET"])
@login_required("part_time_staff")
def view_disputes():
    result = PartTimeStaffControl.view_disputes(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200

# View the logged-in staff member's own working-hour records
@part_time_staff_bp.route("/working-hours", methods=["GET"])
@login_required("part_time_staff")
def view_working_hours():
    result = PartTimeStaffControl.view_working_hours(
        company_id=current_company_id(),
        company_member_id=current_company_member_id()
    )

    return jsonify(result), 200