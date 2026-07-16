from flask import Blueprint, jsonify, request
from control.public_control import PublicControl

public_bp = Blueprint("public", __name__, url_prefix="/api/public")


@public_bp.route("/product-info", methods=["GET"])
def product_info():
    return jsonify(PublicControl.get_product_information())


@public_bp.route("/reviews", methods=["GET"])
def reviews():
    return jsonify(PublicControl.get_reviews())


@public_bp.route("/contact", methods=["GET"])
def contact_information():
    return jsonify(PublicControl.get_contact_information())


@public_bp.route("/contact", methods=["POST"])
def submit_contact_enquiry():
    data = request.get_json() or {}
    result = PublicControl.submit_contact_enquiry(data)
    return jsonify(result), 201 if result["success"] else 400


@public_bp.route("/subscription-plans", methods=["GET"])
def subscription_plans():
    return jsonify(PublicControl.get_subscription_plans())


@public_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    result = PublicControl.register_account(data)
    return jsonify(result), 201 if result["success"] else 400


@public_bp.route("/faq", methods=["GET"])
def faq():
    return jsonify(PublicControl.get_faq())