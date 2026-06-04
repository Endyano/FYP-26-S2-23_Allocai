import psycopg2
from psycopg2.extras import RealDictCursor


class UserAccount:

    def __init__(self):
        self.connection_config = {
            "dbname": "task_allocation_db",
            "user": "postgres",
            "password": "fypsql",
            "host": "localhost",
            "port": "5432"
        }

    def verify(self, username, password):
        connection = None
        cursor = None

        try:
            connection = psycopg2.connect(**self.connection_config)
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            query = """
                SELECT 
                    p.id,
                    p.full_name,
                    p.email AS username,
                    p.role
                FROM auth.users u
                JOIN public.profiles p ON u.id = p.id
                WHERE p.email = %s
                AND u.raw_user_meta_data->>'password' = %s;
            """

            cursor.execute(query, (username, password))
            user = cursor.fetchone()

            if user is None:
                return None

            user_dict = dict(user)

            role_mapping = {
                'Manager': 'manager',
                'Dept Staff': 'department',
                'Casual Staff': 'casual_staff'
            }

            user_dict['role'] = role_mapping.get(user_dict['role'])

            if user_dict['role'] is None:
                return None

            return user_dict

        except Exception as error:
            print(f"Database authentication query error: {error}")
            return None

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
