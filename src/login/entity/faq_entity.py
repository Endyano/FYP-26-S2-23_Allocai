from db import Database


class FaqEntity:

    @staticmethod
    def get_active_faqs():
        query = """
            SELECT faq_id, question, answer
            FROM faqs
            WHERE faq_status = 'Active'
            ORDER BY faq_id ASC;
        """
        return Database.fetch_all(query)