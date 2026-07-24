from flask import Blueprint, jsonify, request

from auth_helpers import current_company_id, login_required
from control.auth_control import AuthControl

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    result = AuthControl.login(data)
    return jsonify(result), 200 if result["success"] else 401


@auth_bp.route("/logout", methods=["POST", "GET"])
def logout():
    return jsonify(AuthControl.logout())


@auth_bp.route("/subscription/purchase", methods=["POST"])
@login_required()
def purchase_subscription():
    data = request.get_json() or {}

    result = AuthControl.purchase_subscription(
        company_id=current_company_id(),
        subscription_plan_id=data.get("subscription_plan_id")
    )

    return jsonify(result), 200 if result["success"] else 400


@auth_bp.route("/faq", methods=["GET"])
@login_required()
def registered_faq():
    return jsonify(AuthControl.get_faq())