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
