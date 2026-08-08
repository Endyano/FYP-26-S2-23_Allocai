from flask import Blueprint, jsonify, request

from auth_helpers import current_company_id, current_user_id, login_required
from control.auth_control import AuthControl

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    result = AuthControl.login(data)
    return jsonify(result), 200 if result["success"] else 401


@auth_bp.route("/verify-signup", methods=["POST"])
def verify_signup():
    data = request.get_json() or {}

    result = AuthControl.verify_signup(
        email=data.get("email"),
        code=data.get("code")
    )

    return jsonify(result), 200 if result["success"] else 400


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data = request.get_json() or {}

    result = AuthControl.resend_verification(
        email=data.get("email")
    )

    return jsonify(result), 200 if result["success"] else 400


@auth_bp.route("/invitations/<token>", methods=["GET"])
def get_invitation(token):
    result = AuthControl.get_invitation(token)
    return jsonify(result), 200 if result["success"] else 400


@auth_bp.route("/invitations/<token>/accept", methods=["POST"])
def accept_invitation(token):
    data = request.get_json() or {}

    result = AuthControl.accept_invitation(
        token=token,
        data=data
    )

    return jsonify(result), 200 if result["success"] else 400


@auth_bp.route("/setup-workspace", methods=["POST"])
@login_required()
def setup_workspace():
    data = request.get_json() or {}

    result = AuthControl.setup_workspace(
        user_id=current_user_id(),
        data=data
    )

    return jsonify(result), 200 if result["success"] else 400


@auth_bp.route("/session", methods=["GET"])
def get_session():
    result = AuthControl.get_session()
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


@auth_bp.route("/reviews", methods=["POST"])
@login_required()
def submit_review():
    data = request.get_json() or {}

    result = AuthControl.submit_review(
        user_id=current_user_id(),
        company_id=current_company_id(),
        data=data
    )

    return jsonify(result), 201 if result["success"] else 400


@auth_bp.route("/reviews", methods=["GET"])
@login_required()
def my_reviews():
    return jsonify(AuthControl.get_my_reviews(current_user_id()))