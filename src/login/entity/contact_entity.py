from db import Database


class ContactEntity:

    @staticmethod
    def create(name, email, subject, message):
        query = """
            INSERT INTO contact_enquiries (
                name,
                email,
                subject,
                message,
                enquiry_status,
                created_at
            )
            VALUES (%s, %s, %s, %s, 'New', NOW())
            RETURNING *;
        """
        return Database.execute(query, (name, email, subject, message))