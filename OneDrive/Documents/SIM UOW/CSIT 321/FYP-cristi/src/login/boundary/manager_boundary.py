from flask import Blueprint, jsonify, request

from auth_helpers import current_company_id, current_company_member_id, login_required
from control.manager_control import ManagerControl

manager_bp = Blueprint("manager", __name__, url_prefix="/api/manager")


@manager_bp.route("/staff", methods=["GET"])
@login_required("manager")
def view_staff():
    result = ManagerControl.view_staff(
        company_id=current_company_id(),
        search=request.args.get("search"),
        skillset_id=request.args.get("skillset_id"),
        availability_date=request.args.get("availability_date")
    )
    return jsonify(result)


@manager_bp.route("/hours-dashboard", methods=["GET"])
@login_required("manager")
def hours_dashboard():
    return jsonify(ManagerControl.get_hours_dashboard(current_company_id()))


@manager_bp.route("/staff/<int:company_member_id>/skillsets", methods=["POST"])
@login_required("manager")
def assign_skillset(company_member_id):
    data = request.get_json() or {}

    result = ManagerControl.assign_skillset(
        company_id=current_company_id(),
        company_member_id=company_member_id,
        skillset_id=data.get("skillset_id"),
        assigned_by=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 400


@manager_bp.route("/tasks", methods=["POST"])
@login_required("manager")
def create_task():
    data = request.get_json() or {}

    result = ManagerControl.create_task(
        company_id=current_company_id(),
        created_by=current_company_member_id(),
        data=data
    )

    return jsonify(result), 201 if result["success"] else 400


@manager_bp.route("/tasks", methods=["GET"])
@login_required("manager")
def view_tasks():
    return jsonify(ManagerControl.view_tasks(
        company_id=current_company_id(),
        status=request.args.get("status")
    ))


@manager_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@login_required("manager")
def update_task(task_id):
    data = request.get_json() or {}
    result = ManagerControl.update_task(current_company_id(), task_id, data)
    return jsonify(result), 200 if result["success"] else 400


@manager_bp.route("/tasks/<int:task_id>/cancel", methods=["PATCH"])
@login_required("manager")
def cancel_task(task_id):
    data = request.get_json() or {}

    result = ManagerControl.cancel_task(
        company_id=current_company_id(),
        task_id=task_id,
        reason=data.get("reason")
    )

    return jsonify(result), 200 if result["success"] else 400


@manager_bp.route("/tasks/<int:task_id>/assign", methods=["POST", "PATCH"])
@login_required("manager")
def assign_task(task_id):
    data = request.get_json() or {}

    result = ManagerControl.assign_task(
        company_id=current_company_id(),
        task_id=task_id,
        assigned_to=data.get("assigned_to"),
        assigned_by=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 400


@manager_bp.route("/allocation-status", methods=["GET"])
@login_required("manager")
def allocation_status():
    return jsonify(ManagerControl.get_allocation_status(current_company_id()))

@manager_bp.route("/staff-skillsets/<int:staff_skillset_id>", methods=["PUT"])
@login_required("manager")
def update_staff_skillset(staff_skillset_id):
    data = request.get_json() or {}

    result = ManagerControl.update_staff_skillset(
        company_id=current_company_id(),
        staff_skillset_id=staff_skillset_id,
        skillset_id=data.get("skillset_id")
    )

    return jsonify(result), 200 if result["success"] else 400


@manager_bp.route("/tasks/<int:task_id>/suggestions", methods=["GET"])
@login_required("manager")
def allocation_suggestions(task_id):
    return jsonify(ManagerControl.get_allocation_suggestions(
        current_company_id(),
        task_id
    ))


@manager_bp.route("/disputes", methods=["GET"])
@login_required("manager")
def disputes():
    return jsonify(ManagerControl.get_disputes(current_company_id()))


@manager_bp.route("/disputes/<int:dispute_request_id>/resolve", methods=["PATCH"])
@login_required("manager")
def resolve_dispute(dispute_request_id):
    data = request.get_json() or {}

    result = ManagerControl.resolve_dispute(
        company_id=current_company_id(),
        dispute_request_id=dispute_request_id,
        action=data.get("action"),
        reviewed_by=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 400


@manager_bp.route("/cancellation-requests", methods=["GET"])
@login_required("manager")
def cancellation_requests():
    return jsonify(ManagerControl.get_cancellation_requests(current_company_id()))


@manager_bp.route("/cancellation-requests/<int:cancellation_request_id>/resolve", methods=["PATCH"])
@login_required("manager")
def resolve_cancellation(cancellation_request_id):
    data = request.get_json() or {}

    result = ManagerControl.resolve_cancellation_request(
        company_id=current_company_id(),
        cancellation_request_id=cancellation_request_id,
        action=data.get("action"),
        reviewed_by=current_company_member_id()
    )

    return jsonify(result), 200 if result["success"] else 400