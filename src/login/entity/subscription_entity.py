from db import Database


class SubscriptionEntity:

    @staticmethod
    def get_active_plans():
        query = """
            SELECT
                subscription_plan_id,
                plan_name,
                plan_description,
                plan_price,
                staff_cap,
                feature_gate
            FROM subscription_plans
            WHERE plan_status = 'Active'
            ORDER BY plan_price ASC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def get_plan_by_id(subscription_plan_id):
        query = """
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_id = %s
            AND plan_status = 'Active';
        """
        return Database.fetch_one(query, (subscription_plan_id,))

    @staticmethod
    def create_company_subscription(company_id, subscription_plan_id):
        query = """
            INSERT INTO company_subscriptions (
                company_id,
                subscription_plan_id,
                subscription_status,
                payment_status,
                start_date,
                created_at,
                updated_at
            )
            VALUES (%s, %s, 'Active', 'Paid', CURRENT_DATE, NOW(), NOW())
            RETURNING *;
        """
        return Database.execute(query, (company_id, subscription_plan_id))