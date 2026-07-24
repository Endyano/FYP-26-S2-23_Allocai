from flask import Blueprint, jsonify, request

from auth_helpers import current_user_id, login_required
from control.platform_admin_control import PlatformAdminControl

platform_admin_bp = Blueprint(
    "platform_admin",
    __name__,
    url_prefix="/api/platform-admin"
)


@platform_admin_bp.route("/companies", methods=["GET"])
@login_required("platform_admin")
def view_companies():
    return jsonify(PlatformAdminControl.view_companies())


@platform_admin_bp.route("/companies/<int:company_id>/suspend", methods=["PATCH"])
@login_required("platform_admin")
def suspend_company(company_id):
    result = PlatformAdminControl.suspend_company(
        company_id=company_id,
        user_id=current_user_id()
    )
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/companies/<int:company_id>", methods=["DELETE"])
@login_required("platform_admin")
def delete_company(company_id):
    result = PlatformAdminControl.delete_company(
        company_id=company_id,
        user_id=current_user_id()
    )
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/subscription-plans", methods=["GET"])
@login_required("platform_admin")
def view_subscription_plans():
    return jsonify(PlatformAdminControl.view_subscription_plans())


@platform_admin_bp.route("/subscription-plans", methods=["POST"])
@login_required("platform_admin")
def create_subscription_plan():
    data = request.get_json() or {}
    result = PlatformAdminControl.create_subscription_plan(data)
    return jsonify(result), 201 if result["success"] else 400


@platform_admin_bp.route("/subscription-plans/<int:subscription_plan_id>", methods=["PUT"])
@login_required("platform_admin")
def update_subscription_plan(subscription_plan_id):
    data = request.get_json() or {}
    result = PlatformAdminControl.update_subscription_plan(subscription_plan_id, data)
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/reviews", methods=["GET"])
@login_required("platform_admin")
def view_reviews():
    return jsonify(PlatformAdminControl.view_reviews())


@platform_admin_bp.route("/reviews/<int:review_id>/moderate", methods=["PATCH"])
@login_required("platform_admin")
def moderate_review(review_id):
    data = request.get_json() or {}
    result = PlatformAdminControl.moderate_review(
        review_id=review_id,
        review_status=data.get("review_status")
    )
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/analytics", methods=["GET"])
@login_required("platform_admin")
def analytics():
    return jsonify(PlatformAdminControl.view_analytics())


@platform_admin_bp.route("/audit-logs", methods=["GET"])
@login_required("platform_admin")
def audit_logs():
    return jsonify(PlatformAdminControl.view_audit_logs())