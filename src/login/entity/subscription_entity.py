from psycopg2.extras import Json

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
            WHERE plan_status = 'active'
            ORDER BY plan_price ASC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def get_plan_by_id(subscription_plan_id):
        query = """
            SELECT *
            FROM subscription_plans
            WHERE subscription_plan_id = %s
            AND plan_status = 'active';
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
            VALUES (%s, %s, 'active', 'paid', CURRENT_DATE, NOW(), NOW())
            RETURNING *;
        """
        return Database.execute(query, (company_id, subscription_plan_id))

    @staticmethod
    def get_all_plans():
        query = """
            SELECT
                subscription_plan_id,
                plan_name,
                plan_description,
                plan_price,
                staff_cap,
                feature_gate,
                plan_status,
                created_at,
                updated_at
            FROM subscription_plans
            ORDER BY created_at DESC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def create_plan(data):
        query = """
            INSERT INTO subscription_plans (
                plan_name,
                plan_description,
                plan_price,
                staff_cap,
                feature_gate,
                plan_status,
                created_at,
                updated_at
            )
            VALUES (%s, %s, %s, %s, %s, 'active', NOW(), NOW())
            RETURNING *;
        """

        feature_gate = data.get("feature_gate")

        return Database.execute(query, (
            data.get("plan_name"),
            data.get("plan_description"),
            data.get("plan_price"),
            data.get("staff_cap"),
            Json(feature_gate) if feature_gate is not None else None
        ))

    @staticmethod
    def update_plan(subscription_plan_id, data):
        query = """
            UPDATE subscription_plans
            SET
                plan_name = COALESCE(%s, plan_name),
                plan_description = COALESCE(%s, plan_description),
                plan_price = COALESCE(%s, plan_price),
                staff_cap = COALESCE(%s, staff_cap),
                feature_gate = COALESCE(%s, feature_gate),
                plan_status = COALESCE(%s, plan_status),
                updated_at = NOW()
            WHERE subscription_plan_id = %s
            RETURNING *;
        """

        feature_gate = data.get("feature_gate")

        return Database.execute(query, (
            data.get("plan_name"),
            data.get("plan_description"),
            data.get("plan_price"),
            data.get("staff_cap"),
            Json(feature_gate) if feature_gate is not None else None,
            data.get("plan_status"),
            subscription_plan_id
        ))

    @staticmethod
    def get_subscription_summary():
        query = """
            SELECT
                subscription_status,
                payment_status,
                COUNT(*) AS total
            FROM company_subscriptions
            GROUP BY subscription_status, payment_status
            ORDER BY subscription_status ASC, payment_status ASC;
        """
        return Database.fetch_all(query)