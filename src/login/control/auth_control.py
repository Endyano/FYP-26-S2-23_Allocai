from flask import session

from entity.company_member_entity import CompanyMemberEntity
from entity.faq_entity import FaqEntity
from entity.subscription_entity import SubscriptionEntity
from entity.user_entity import UserEntity


class AuthControl:

    ROLE_MAP = {
        "registered_user": "registered_user",
        "manager": "manager",
        "company_admin": "company_admin",
        "platform_admin": "platform_admin",
        "full_time_staff": "full_time_staff",
        "part_time_staff": "part_time_staff",
    }

    @staticmethod
    def login(data):
        email = data.get("email") or data.get("username")
        password = data.get("password")
        requested_role = data.get("role")

        if not email or not password or not requested_role:
            return {
                "success": False,
                "message": "Email, password, and role are required."
            }

        role = AuthControl.ROLE_MAP.get(requested_role)

        if not role:
            return {
                "success": False,
                "message": "Invalid role selected."
            }

        user = UserEntity.verify_login(email, password)

        if not user:
            return {
                "success": False,
                "message": "Invalid email or password."
            }

        if user.get("account_status") == "Suspended":
            return {
                "success": False,
                "message": "This account is suspended."
            }

        member = None

        if role == "registered_user":
            if user.get("global_role") not in ["registered_user", "platform_admin"]:
                return {
                    "success": False,
                    "message": "Invalid role for this account."
                }
        else:
            member = CompanyMemberEntity.get_active_member_by_user_and_role(
                user_id=user["user_id"],
                role=role
            )

            if not member:
                return {
                    "success": False,
                    "message": "You do not have access to this workspace role."
                }

        session["user_id"] = str(user["user_id"])
        session["full_name"] = user["full_name"]
        session["email"] = user["email"]
        session["role"] = role
        session["company_id"] = str(member["company_id"]) if member else None
        session["company_member_id"] = str(member["company_member_id"]) if member else None

        redirect_map = {
            "registered_user": "/Features/dashboard",
            "manager": "/Features/manager_dashboard",
            "company_admin": "/Features/company_admin_dashboard",
            "platform_admin": "/Features/platform_admin_dashboard",
            "full_time_staff": "/Features/full_time_staff_dashboard",
            "part_time_staff": "/Features/part_time_staff_dashboard",
        }

        return {
            "success": True,
            "message": "Login successful.",
            "role": role,
            "full_name": user["full_name"],
            "redirect_to": redirect_map.get(role, "/")
        }

    @staticmethod
    def logout():
        session.clear()

        return {
            "success": True,
            "message": "Logout successful.",
            "redirect_to": "/"
        }

    @staticmethod
    def purchase_subscription(company_id, subscription_plan_id):
        if not company_id:
            return {
                "success": False,
                "message": "Company workspace is required to purchase a subscription."
            }

        if not subscription_plan_id:
            return {
                "success": False,
                "message": "Subscription plan is required."
            }

        plan = SubscriptionEntity.get_plan_by_id(subscription_plan_id)

        if not plan:
            return {
                "success": False,
                "message": "Subscription plan was not found."
            }

        subscription = SubscriptionEntity.create_company_subscription(
            company_id=company_id,
            subscription_plan_id=subscription_plan_id
        )

        return {
            "success": True,
            "message": "Subscription purchased successfully.",
            "subscription": subscription
        }

    @staticmethod
    def get_faq():
        return {
            "success": True,
            "faq": FaqEntity.get_active_faqs()
        }