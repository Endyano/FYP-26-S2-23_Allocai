from db import Database


class FaqEntity:

    @staticmethod
    def get_active_faqs():
        query = """
            SELECT faq_id, question, answer
            FROM faqs
            WHERE faq_status = 'Active'
            ORDER BY display_order ASC, created_at ASC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def get_all():
        query = """
            SELECT faq_id, question, answer, display_order, faq_status, created_at, updated_at
            FROM faqs
            ORDER BY display_order ASC, created_at ASC;
        """
        return Database.fetch_all(query)

    @staticmethod
    def create(question, answer, display_order=0):
        query = """
            INSERT INTO faqs (question, answer, display_order, faq_status)
            VALUES (%s, %s, %s, 'Active')
            RETURNING *;
        """
        return Database.execute(query, (question, answer, display_order))

    @staticmethod
    def update(faq_id, data):
        query = """
            UPDATE faqs
            SET question = COALESCE(%s, question),
                answer = COALESCE(%s, answer),
                display_order = COALESCE(%s, display_order),
                faq_status = COALESCE(%s, faq_status),
                updated_at = now()
            WHERE faq_id = %s
            RETURNING *;
        """
        return Database.execute(query, (
            data.get("question"),
            data.get("answer"),
            data.get("display_order"),
            data.get("faq_status"),
            faq_id
        ))

    @staticmethod
    def delete(faq_id):
        query = "DELETE FROM faqs WHERE faq_id = %s RETURNING faq_id;"
        return Database.execute(query, (faq_id,))