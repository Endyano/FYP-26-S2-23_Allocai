from entity.contact_entity import ContactEntity
from entity.faq_entity import FaqEntity
from entity.review_entity import ReviewEntity
from entity.subscription_entity import SubscriptionEntity
from entity.user_entity import UserEntity
from supabase_auth import SupabaseAuth


class PublicControl:

    @staticmethod
    def get_product_information():
        return {
            "success": True,
            "product": {
                "name": "AllocAI",
                "description": "A task allocation and staff scheduling platform for managing company workforces.",
                "features": [
                    "Role-based access",
                    "Staff profile management",
                    "Task creation and allocation",
                    "Working-hour eligibility tracking",
                    "Dispute and cancellation request handling",
                    "Subscription-based company access"
                ]
            }
        }

    @staticmethod
    def get_reviews():
        return {
            "success": True,
            "reviews": ReviewEntity.get_approved_reviews()
        }

    @staticmethod
    def get_contact_information():
        return {
            "success": True,
            "contact": {
                "email": "support@allocai.com",
                "phone": "+65 6123 4567",
                "address": "Singapore",
                "support_hours": "Monday to Friday, 9:00 AM to 6:00 PM"
            }
        }

    @staticmethod
    def submit_contact_enquiry(data):
        required_fields = ["name", "email", "subject", "message"]

        for field in required_fields:
            if not data.get(field):
                return {
                    "success": False,
                    "message": f"{field} is required."
                }

        enquiry = ContactEntity.create(
            name=data.get("name"),
            email=data.get("email"),
            subject=data.get("subject"),
            message=data.get("message")
        )

        return {
            "success": True,
            "message": "Contact enquiry submitted successfully.",
            "enquiry": enquiry
        }

    @staticmethod
    def get_subscription_plans():
        return {
            "success": True,
            "plans": SubscriptionEntity.get_active_plans()
        }

    @staticmethod
    def register_account(data):
        required_fields = ["full_name", "email", "password"]

        for field in required_fields:
            if not data.get(field):
                return {
                    "success": False,
                    "message": f"{field} is required."
                }

        if UserEntity.get_by_email(data.get("email")):
            return {
                "success": False,
                "message": "Email is already registered."
            }

        status_code, result = SupabaseAuth.sign_up(
            email=data.get("email"),
            password=data.get("password"),
            full_name=data.get("full_name"),
            phone_number=data.get("phone_number")
        )

        if status_code >= 400:
            return {
                "success": False,
                "message": (
                    result.get("error_description")
                    or result.get("msg")
                    or "Registration failed."
                )
            }

        return {
            "success": True,
            "message": "Account registered. Check your email for a verification code.",
            "email": data.get("email")
        }

    @staticmethod
    def get_faq():
        return {
            "success": True,
            "faq": FaqEntity.get_active_faqs()
        }