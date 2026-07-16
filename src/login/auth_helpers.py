from functools import wraps
from flask import jsonify, session


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