from db import Database


class ReviewEntity:

    @staticmethod
    def get_approved_reviews():
        query = """
            SELECT
                r.review_id,
                r.rating,
                r.review_text,
                r.reviewer_title,
                r.created_at,
                u.full_name,
                c.company_name
            FROM reviews r
            LEFT JOIN users u ON u.user_id = r.user_id
            LEFT JOIN companies c ON c.company_id = r.company_id
            WHERE r.review_status = 'published'
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
                r.reviewer_title,
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
    def create(user_id, company_id, rating, review_text, reviewer_title):
        query = """
            INSERT INTO reviews (
                user_id, company_id, rating, review_text, reviewer_title, review_status
            )
            VALUES (%s, %s, %s, %s, %s, 'pending')
            RETURNING *;
        """
        return Database.execute(query, (
            user_id, company_id, rating, review_text, reviewer_title
        ))

    @staticmethod
    def get_by_user(user_id):
        query = """
            SELECT review_id, rating, review_text, reviewer_title, review_status, created_at
            FROM reviews
            WHERE user_id = %s
            ORDER BY created_at DESC;
        """
        return Database.fetch_all(query, (user_id,))

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