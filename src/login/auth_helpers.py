from functools import wraps
from flask import jsonify, session

from entity.company_member_entity import CompanyMemberEntity


def login_required(required_role=None):
    def decorator(route_function):
        @wraps(route_function)
        def wrapper(*args, **kwargs):
            if "user_id" not in session:
                return jsonify({
                    "success": False,
                    "message": "Please log in first."
                }), 401

            if required_role and session.get("role") != required_role:
                return jsonify({
                    "success": False,
                    "message": "Access denied."
                }), 403

            # Re-check suspension/removal on every request, not just at
            # login, so a suspension takes effect immediately instead of
            # only the next time the user logs in.
            status = CompanyMemberEntity.get_session_validity(
                user_id=session.get("user_id"),
                company_member_id=session.get("company_member_id")
            )

            if not status or status["account_status"] != "active":
                session.clear()
                return jsonify({
                    "success": False,
                    "message": "This account is suspended or no longer exists. Please log in again."
                }), 401

            if session.get("company_member_id"):
                if status["member_status"] != "active":
                    session.clear()
                    return jsonify({
                        "success": False,
                        "message": "Your account has been suspended by your company admin."
                    }), 401

                if status["company_status"] != "active":
                    session.clear()
                    return jsonify({
                        "success": False,
                        "message": "Your company's workspace has been suspended. Please contact your platform administrator."
                    }), 401

            return route_function(*args, **kwargs)

        return wrapper

    return decorator


def current_user_id():
    return session.get("user_id")


def current_company_id():
    return session.get("company_id")


def current_company_member_id():
    return session.get("company_member_id")


def current_role():
    return session.get("role")