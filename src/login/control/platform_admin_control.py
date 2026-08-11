from datetime import date

from entity.audit_log_entity import AuditLogEntity
from entity.company_entity import CompanyEntity
from entity.faq_entity import FaqEntity
from entity.review_entity import ReviewEntity
from entity.subscription_entity import SubscriptionEntity
from entity.user_entity import UserEntity


class PlatformAdminControl:

    @staticmethod
    def view_companies():
        return {
            "success": True,
            "companies": CompanyEntity.get_all()
        }

    @staticmethod
    def suspend_company(company_id, user_id):
        company = CompanyEntity.update_status(company_id, "suspended")

        if not company:
            return {
                "success": False,
                "message": "Company account was not found."
            }

        return {
            "success": True,
            "message": "Company account suspended successfully.",
            "company": company
        }

    @staticmethod
    def unsuspend_company(company_id, user_id):
        company = CompanyEntity.update_status(company_id, "active")

        if not company:
            return {
                "success": False,
                "message": "Company account was not found."
            }

        return {
            "success": True,
            "message": "Company account reactivated successfully.",
            "company": company
        }

    @staticmethod
    def delete_company(company_id, user_id):
        company = CompanyEntity.update_status(company_id, "cancelled")

        if not company:
            return {
                "success": False,
                "message": "Company account was not found."
            }

        return {
            "success": True,
            "message": "Company account cancelled successfully.",
            "company": company
        }

    @staticmethod
    def view_subscription_plans():
        return {
            "success": True,
            "plans": SubscriptionEntity.get_all_plans()
        }

    @staticmethod
    def create_subscription_plan(data):
        required_fields = ["plan_name", "plan_price", "staff_cap"]

        for field in required_fields:
            if data.get(field) is None:
                return {
                    "success": False,
                    "message": f"{field} is required."
                }

        plan = SubscriptionEntity.create_plan(data)

        return {
            "success": True,
            "message": "Subscription plan created successfully.",
            "plan": plan
        }

    @staticmethod
    def update_subscription_plan(subscription_plan_id, data):
        plan = SubscriptionEntity.update_plan(subscription_plan_id, data)

        if not plan:
            return {
                "success": False,
                "message": "Subscription plan was not found."
            }

        return {
            "success": True,
            "message": "Subscription plan updated successfully.",
            "plan": plan
        }

    @staticmethod
    def view_reviews():
        return {
            "success": True,
            "reviews": ReviewEntity.get_all_reviews()
        }

    @staticmethod
    def moderate_review(review_id, review_status):
        if review_status not in ["published", "pending"]:
            return {
                "success": False,
                "message": "Review status must be published or pending."
            }

        review = ReviewEntity.update_status(review_id, review_status)

        if not review:
            return {
                "success": False,
                "message": "Review was not found."
            }

        return {
            "success": True,
            "message": "Review moderated successfully.",
            "review": review
        }

    @staticmethod
    def view_analytics():
        return {
            "success": True,
            "analytics": {
                "companies": CompanyEntity.get_company_status_summary(),
                "subscriptions": SubscriptionEntity.get_subscription_summary(),
                "reviews": ReviewEntity.get_review_status_summary(),
                "user_growth": UserEntity.get_monthly_growth(),
                "revenue": SubscriptionEntity.get_monthly_revenue()
            }
        }

    @staticmethod
    def view_audit_logs(start_date=None, end_date=None):
        try:
            parsed_start = date.fromisoformat(start_date) if start_date else None
            parsed_end = date.fromisoformat(end_date) if end_date else None
        except ValueError:
            return {
                "success": False,
                "message": "Dates must use the YYYY-MM-DD format."
            }

        if parsed_start and parsed_end and parsed_start > parsed_end:
            return {
                "success": False,
                "message": "Start date cannot be later than end date."
            }

        return {
            "success": True,
            "audit_logs": AuditLogEntity.get_recent_logs(
                start_date=start_date,
                end_date=end_date
            )
        }

    @staticmethod
    def view_faqs():
        return {
            "success": True,
            "faqs": FaqEntity.get_all()
        }

    @staticmethod
    def create_faq(data):
        question = (data.get("question") or "").strip()
        answer = (data.get("answer") or "").strip()

        if not question or not answer:
            return {
                "success": False,
                "message": "Question and answer are required."
            }

        faq = FaqEntity.create(
            question=question,
            answer=answer,
            display_order=data.get("display_order") or 0
        )

        return {
            "success": True,
            "message": "FAQ created successfully.",
            "faq": faq
        }

    @staticmethod
    def update_faq(faq_id, data):
        faq = FaqEntity.update(faq_id, data)

        if not faq:
            return {
                "success": False,
                "message": "FAQ was not found."
            }

        return {
            "success": True,
            "message": "FAQ updated successfully.",
            "faq": faq
        }

    @staticmethod
    def delete_faq(faq_id):
        faq = FaqEntity.delete(faq_id)

        if not faq:
            return {
                "success": False,
                "message": "FAQ was not found."
            }

        return {
            "success": True,
            "message": "FAQ deleted successfully."
        }