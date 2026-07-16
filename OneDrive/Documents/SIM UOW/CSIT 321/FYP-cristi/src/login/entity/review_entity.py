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