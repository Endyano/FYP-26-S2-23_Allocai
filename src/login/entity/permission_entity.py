from db import Database


class PermissionEntity:

    @staticmethod
    def get_all():
        query = """
            SELECT permission_id, permission_key, description
            FROM permissions
            ORDER BY permission_key ASC;
        """
        return Database.fetch_all(query)
