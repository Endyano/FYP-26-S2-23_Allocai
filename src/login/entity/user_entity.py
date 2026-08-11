from db import Database


class UserEntity:

    @staticmethod
    def get_by_email(email):
        query = """
            SELECT *
            FROM users
            WHERE LOWER(email) = LOWER(%s);
        """
        return Database.fetch_one(query, (email,))

    @staticmethod
    def get_by_id(user_id):
        query = """
            SELECT *
            FROM users
            WHERE user_id = %s;
        """
        return Database.fetch_one(query, (user_id,))

    @staticmethod
    def get_monthly_growth():
        query = """
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', CURRENT_DATE) - interval '5 months',
                    date_trunc('month', CURRENT_DATE),
                    interval '1 month'
                )::date AS month_start
            )
            SELECT
                to_char(m.month_start, 'Mon YYYY') AS month_label,
                (
                    SELECT COUNT(*) FROM users u
                    WHERE u.created_at < (m.month_start + interval '1 month')
                ) AS total_users
            FROM months m
            ORDER BY m.month_start ASC;
        """
        return Database.fetch_all(query)
