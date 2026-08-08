from datetime import datetime, timezone

from flask import session

from db import Database
from entity.company_entity import CompanyEntity
from entity.company_member_entity import CompanyMemberEntity
from entity.faq_entity import FaqEntity
from entity.invitation_entity import InvitationEntity
from entity.review_entity import ReviewEntity
from entity.role_entity import RoleEntity
from entity.staff_profile_entity import StaffProfileEntity
from entity.subscription_entity import SubscriptionEntity
from entity.user_entity import UserEntity
from supabase_auth import SupabaseAuth


class AuthControl:

    ROLE_MAP = {
        "registered_user": "registered_user",
        "manager": "manager",
        "company_admin": "company_admin",
        "platform_admin": "platform_admin",
        "full_time_staff": "full_time_staff",
        "part_time_staff": "part_time_staff",
    }

    # Order in which to try roles when the caller doesn't request one
    # explicitly - most privileged/specific workspace role first, plain
    # registered_user last as the fallback everyone qualifies for.
    ROLE_PRIORITY = [
        "platform_admin",
        "company_admin",
        "manager",
        "full_time_staff",
        "part_time_staff",
        "registered_user",
    ]

    @staticmethod
    def _resolve_role_access(user, role):
        # Returns (member_or_None, error_message_or_None) for whether this
        # user account is allowed to log in as the given role.
        if role == "registered_user":
            if user.get("global_role") not in ["user", "platform_admin"]:
                return None, "Invalid role for this account."
            return None, None

        if role == "platform_admin":
            if user.get("global_role") != "platform_admin":
                return None, "Invalid role for this account."
            return None, None

        member = CompanyMemberEntity.get_active_member_by_user_and_role(
            user_id=user["user_id"],
            role=role
        )

        if not member:
            return None, "You do not have access to this workspace role."

        return member, None

    @staticmethod
    def login(data):
        email = data.get("email") or data.get("username")
        password = data.get("password")
        requested_role = data.get("role")

        if not email or not password:
            return {
                "success": False,
                "message": "Email and password are required."
            }

        if requested_role:
            role = AuthControl.ROLE_MAP.get(requested_role)

            if not role:
                return {
                    "success": False,
                    "message": "Invalid role selected."
                }
        else:
            role = None

        status_code, auth_result = SupabaseAuth.sign_in(email, password)

        if status_code >= 400:
            return {
                "success": False,
                "message": (
                    auth_result.get("error_description")
                    or auth_result.get("msg")
                    or "Invalid email or password."
                )
            }

        user = UserEntity.get_by_email(email)

        if not user:
            return {
                "success": False,
                "message": "Account was not found."
            }

        if user.get("account_status") == "suspended":
            return {
                "success": False,
                "message": "This account is suspended."
            }

        member = None

        if role:
            member, error = AuthControl._resolve_role_access(user, role)

            if error:
                return {
                    "success": False,
                    "message": error
                }
        else:
            # No role requested: use the most privileged/specific role
            # this account actually has access to.
            for candidate in AuthControl.ROLE_PRIORITY:
                candidate_member, error = AuthControl._resolve_role_access(user, candidate)

                if not error:
                    role = candidate
                    member = candidate_member
                    break

            if not role:
                return {
                    "success": False,
                    "message": "This account has no accessible role."
                }

        session["user_id"] = str(user["user_id"])
        session["full_name"] = user["full_name"]
        session["email"] = user["email"]
        session["role"] = role
        session["company_id"] = str(member["company_id"]) if member else None
        session["company_member_id"] = str(member["company_member_id"]) if member else None

        redirect_map = {
            "registered_user": "/Features/register/setup-workspace",
            "manager": "/Features/manager_dashboard",
            "company_admin": "/Features/company-admin_dashboard",
            "platform_admin": "/Features/platform-admin_dashboard",
            "full_time_staff": "/Features/department_dashboard",
            "part_time_staff": "/Features/casual-staff_dashboard",
        }

        return {
            "success": True,
            "message": "Login successful.",
            "role": role,
            "full_name": user["full_name"],
            "redirect_to": redirect_map.get(role, "/")
        }

    ROLE_DASHBOARD_MAP = {
        "manager": "/Features/manager_dashboard",
        "company_admin": "/Features/company-admin_dashboard",
        "full_time_staff": "/Features/department_dashboard",
        "part_time_staff": "/Features/casual-staff_dashboard",
    }

    @staticmethod
    def _validate_invitation(invitation):
        if not invitation:
            return "Invitation was not found."

        if invitation["invitation_status"] != "pending":
            return "This invitation is no longer valid."

        expires_at = invitation["expires_at"]

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < datetime.now(timezone.utc):
            return "This invitation has expired."

        return None

    @staticmethod
    def get_invitation(token):
        invitation = InvitationEntity.get_by_token(token)
        error = AuthControl._validate_invitation(invitation)

        if error:
            return {"success": False, "message": error}

        existing_user = UserEntity.get_by_email(invitation["invited_email"])

        return {
            "success": True,
            "invitation": {
                "email": invitation["invited_email"],
                "role": invitation["role_name"],
                "company_name": invitation["company_name"],
                "requires_signup": existing_user is None
            }
        }

    @staticmethod
    def accept_invitation(token, data):
        invitation = InvitationEntity.get_by_token(token)
        error = AuthControl._validate_invitation(invitation)

        if error:
            return {"success": False, "message": error}

        existing_user = UserEntity.get_by_email(invitation["invited_email"])

        if existing_user:
            current_email = session.get("email")

            if not current_email or current_email.lower() != invitation["invited_email"].lower():
                return {
                    "success": False,
                    "message": "Please log in with this email address to accept the invitation."
                }

            user = existing_user
        else:
            full_name = str(data.get("full_name", "")).strip()
            password = data.get("password")

            if not full_name or not password:
                return {
                    "success": False,
                    "message": "Full name and password are required."
                }

            status_code, result = SupabaseAuth.sign_up(
                email=invitation["invited_email"],
                password=password,
                full_name=full_name,
                phone_number=data.get("phone_number")
            )

            if status_code >= 400:
                return {
                    "success": False,
                    "message": (
                        result.get("error_description")
                        or result.get("msg")
                        or "Could not create account."
                    )
                }

            # Accepting the invitation with its secret token already proves
            # ownership of the invited email, so skip the separate signup
            # OTP step and confirm the account immediately.
            new_user_id = result.get("id")

            if new_user_id:
                Database.execute(
                    """
                    UPDATE auth.users
                    SET email_confirmed_at = NOW()
                    WHERE id = %s
                    RETURNING id;
                    """,
                    (new_user_id,)
                )

            user = UserEntity.get_by_email(invitation["invited_email"])

            if not user:
                return {
                    "success": False,
                    "message": "Account could not be created."
                }

        member = CompanyMemberEntity.create(
            company_id=invitation["company_id"],
            user_id=user["user_id"]
        )

        RoleEntity.assign_to_member(
            company_id=invitation["company_id"],
            company_member_id=member["company_member_id"],
            role_id=invitation["invited_role_id"],
            assigned_by=invitation["invited_by"]
        )

        if invitation["employee_type"]:
            StaffProfileEntity.create(
                company_id=invitation["company_id"],
                company_member_id=member["company_member_id"],
                employee_type=invitation["employee_type"],
                department_id=invitation["department_id"]
            )

        InvitationEntity.mark_accepted(
            invitation_id=invitation["invitation_id"],
            accepted_by=user["user_id"]
        )

        session["user_id"] = str(user["user_id"])
        session["full_name"] = user["full_name"]
        session["email"] = user["email"]
        session["role"] = invitation["role_name"]
        session["company_id"] = str(invitation["company_id"])
        session["company_member_id"] = str(member["company_member_id"])

        return {
            "success": True,
            "message": "Invitation accepted successfully.",
            "redirect_to": AuthControl.ROLE_DASHBOARD_MAP.get(invitation["role_name"], "/")
        }

    @staticmethod
    def verify_signup(email, code):
        if not email or not code:
            return {
                "success": False,
                "message": "Email and verification code are required."
            }

        status_code, result = SupabaseAuth.verify_otp(
            email=email,
            token=code,
            otp_type="signup"
        )

        if status_code >= 400:
            return {
                "success": False,
                "message": (
                    result.get("error_description")
                    or result.get("msg")
                    or "Invalid or expired verification code."
                )
            }

        user = UserEntity.get_by_email(email)

        if not user:
            return {
                "success": False,
                "message": "Account was not found."
            }

        session["user_id"] = str(user["user_id"])
        session["full_name"] = user["full_name"]
        session["email"] = user["email"]
        session["role"] = "registered_user"
        session["company_id"] = None
        session["company_member_id"] = None

        return {
            "success": True,
            "message": "Email verified successfully.",
            "redirect_to": "/Features/register/setup-workspace"
        }

    @staticmethod
    def resend_verification(email):
        if not email:
            return {
                "success": False,
                "message": "Email is required."
            }

        status_code, result = SupabaseAuth.resend_otp(
            email=email,
            otp_type="signup"
        )

        if status_code >= 400:
            return {
                "success": False,
                "message": (
                    result.get("error_description")
                    or result.get("msg")
                    or "Could not resend the verification code."
                )
            }

        return {
            "success": True,
            "message": "Verification code resent."
        }

    @staticmethod
    def setup_workspace(user_id, data):
        company_name = str(data.get("company_name", "")).strip()

        if not company_name:
            return {
                "success": False,
                "message": "Company name is required."
            }

        existing_member = CompanyMemberEntity.get_active_member_by_user_and_role(
            user_id=user_id,
            role="company_admin"
        )

        if existing_member:
            return {
                "success": False,
                "message": "You already have a company workspace."
            }

        company = CompanyEntity.create(
            company_name=company_name,
            company_email=data.get("company_email"),
            company_phone=data.get("company_phone"),
            company_address=data.get("company_address"),
            industry=data.get("industry"),
            created_by=user_id
        )

        if not company:
            return {
                "success": False,
                "message": "Company workspace could not be created."
            }

        RoleEntity.seed_system_roles(company["company_id"])

        company_admin_role = RoleEntity.get_by_name(
            company_id=company["company_id"],
            role_name="company_admin"
        )

        member = CompanyMemberEntity.create(
            company_id=company["company_id"],
            user_id=user_id
        )

        RoleEntity.assign_to_member(
            company_id=company["company_id"],
            company_member_id=member["company_member_id"],
            role_id=company_admin_role["role_id"],
            assigned_by=member["company_member_id"]
        )

        session["role"] = "company_admin"
        session["company_id"] = str(company["company_id"])
        session["company_member_id"] = str(member["company_member_id"])

        return {
            "success": True,
            "message": "Company workspace created successfully.",
            "company": company,
            "redirect_to": "/Features/company-admin_dashboard"
        }

    @staticmethod
    def get_session():
        if "user_id" not in session:
            return {
                "success": False,
                "message": "Not logged in."
            }

        return {
            "success": True,
            "user_id": session.get("user_id"),
            "full_name": session.get("full_name"),
            "email": session.get("email"),
            "role": session.get("role"),
            "company_id": session.get("company_id"),
            "company_member_id": session.get("company_member_id"),
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

    @staticmethod
    def submit_review(user_id, company_id, data):
        rating = data.get("rating")

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return {
                "success": False,
                "message": "A rating from 1 to 5 is required."
            }

        if rating < 1 or rating > 5:
            return {
                "success": False,
                "message": "Rating must be between 1 and 5."
            }

        review = ReviewEntity.create(
            user_id=user_id,
            company_id=company_id,
            rating=rating,
            review_text=(data.get("review_text") or "").strip() or None,
            reviewer_title=(data.get("reviewer_title") or "").strip() or None
        )

        return {
            "success": True,
            "message": "Thanks for your review! It will appear publicly once approved.",
            "review": review
        }

    @staticmethod
    def get_my_reviews(user_id):
        return {
            "success": True,
            "reviews": ReviewEntity.get_by_user(user_id)
        }