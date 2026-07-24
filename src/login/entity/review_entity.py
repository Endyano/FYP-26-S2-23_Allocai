from db import Database


class ReviewEntity:

    @staticmethod
    def get_approved_reviews():
        query = """
            SELECT
                r.review_id,
                r.rating,
                r.review_text,
                r.created_at,
                u.full_name,
                c.company_name
            FROM reviews r
            LEFT JOIN users u ON u.user_id = r.user_id
            LEFT JOIN companies c ON c.company_id = r.company_id
            WHERE r.review_status = 'Approved'
            ORDER BY r.created_at DESC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def get_all_reviews():
        query = """
            SELECT
                r.review_id,
                r.user_id,
                r.company_id,
                r.rating,
                r.review_text,
                r.review_status,
                r.created_at,
                u.full_name,
                u.email,
                c.company_name
            FROM reviews r
            LEFT JOIN users u ON u.user_id = r.user_id
            LEFT JOIN companies c ON c.company_id = r.company_id
            ORDER BY r.created_at DESC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def update_status(review_id, review_status):
        query = """
            UPDATE reviews
            SET review_status = %s
            WHERE review_id = %s
            RETURNING *;
        """
        return Database.execute(query, (review_status, review_id))

    @staticmethod
    def get_review_status_summary():
        query = """
            SELECT review_status, COUNT(*) AS total
            FROM reviews
            GROUP BY review_status
            ORDER BY review_status ASC;
        """
        return Database.fetch_all(query)