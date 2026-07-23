from flask import Blueprint, jsonify, request

from auth_helpers import (
    current_company_id,
    current_company_member_id,
    login_required
)
from control.company_admin_control import CompanyAdminControl


# Group all Company Admin API routes
company_admin_bp = Blueprint(
    "company_admin",
    __name__,
    url_prefix="/api/company-admin"
)