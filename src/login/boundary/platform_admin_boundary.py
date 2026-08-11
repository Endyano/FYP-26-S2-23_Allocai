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


@platform_admin_bp.route("/companies/<company_id>/suspend", methods=["PATCH"])
@login_required("platform_admin")
def suspend_company(company_id):
    result = PlatformAdminControl.suspend_company(
        company_id=company_id,
        user_id=current_user_id()
    )
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/companies/<company_id>", methods=["DELETE"])
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


@platform_admin_bp.route("/subscription-plans/<subscription_plan_id>", methods=["PUT"])
@login_required("platform_admin")
def update_subscription_plan(subscription_plan_id):
    data = request.get_json() or {}
    result = PlatformAdminControl.update_subscription_plan(subscription_plan_id, data)
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/reviews", methods=["GET"])
@login_required("platform_admin")
def view_reviews():
    return jsonify(PlatformAdminControl.view_reviews())


@platform_admin_bp.route("/reviews/<review_id>/moderate", methods=["PATCH"])
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
    result = PlatformAdminControl.view_audit_logs(
        start_date=request.args.get("start_date"),
        end_date=request.args.get("end_date")
    )
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/faqs", methods=["GET"])
@login_required("platform_admin")
def view_faqs():
    return jsonify(PlatformAdminControl.view_faqs())


@platform_admin_bp.route("/faqs", methods=["POST"])
@login_required("platform_admin")
def create_faq():
    data = request.get_json() or {}
    result = PlatformAdminControl.create_faq(data)
    return jsonify(result), 201 if result["success"] else 400


@platform_admin_bp.route("/faqs/<faq_id>", methods=["PUT", "PATCH"])
@login_required("platform_admin")
def update_faq(faq_id):
    data = request.get_json() or {}
    result = PlatformAdminControl.update_faq(faq_id, data)
    return jsonify(result), 200 if result["success"] else 400


@platform_admin_bp.route("/faqs/<faq_id>", methods=["DELETE"])
@login_required("platform_admin")
def delete_faq(faq_id):
    result = PlatformAdminControl.delete_faq(faq_id)
    return jsonify(result), 200 if result["success"] else 400