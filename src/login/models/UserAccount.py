import psycopg2
from psycopg2.extras import RealDictCursor


class UserAccount:

    ROLE_TO_DB = {
        'manager': 'Manager',
        'department': 'Dept Staff',
        'casual_staff': 'Casual Staff'
    }

    DB_TO_ROLE = {
        'Manager': 'manager',
        'Dept Staff': 'department',
        'Casual Staff': 'casual_staff'
    }

    SUSPENDED_STATUSES = {
        'suspended',
        'inactive',
        'disabled',
        'blocked'
    }

    def __init__(self):
        self.connection_config = {
            "dbname": "task_allocation_db",
            "user": "postgres",
            "password": "fypsql",
            "host": "localhost",
            "port": "5432"
        }

    def get_connection(self):
        return psycopg2.connect(**self.connection_config)

    def get_profile_status_column(self, cursor):
        possible_columns = ['status', 'account_status', 'user_status']

        query = """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'profiles'
            AND column_name = ANY(%s);
        """

        cursor.execute(query, (possible_columns,))
        existing_columns = [row['column_name'] for row in cursor.fetchall()]

        for column in possible_columns:
            if column in existing_columns:
                return column

        return None

    def verify(self, username, password, role):
        connection = None
        cursor = None

        db_role = self.ROLE_TO_DB.get(role)

        if db_role is None:
            return None

        try:
            connection = self.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)

            status_column = self.get_profile_status_column(cursor)
            status_select = ""

            if status_column:
                status_select = f", p.{status_column} AS account_status"

            query = """
                SELECT 
                    p.id,
                    p.full_name,
                    p.email AS username,
                    p.role
                    {status_select}
                FROM auth.users u
                JOIN public.profiles p ON u.id = p.id
                WHERE p.email = %s
                AND u.raw_user_meta_data->>'password' = %s
                AND p.role = %s;
            """.format(status_select=status_select)

            cursor.execute(query, (username, password, db_role))
            user = cursor.fetchone()

            if user is None:
                return None

            user_dict = dict(user)
            user_dict['role'] = self.DB_TO_ROLE.get(user_dict['role'])

            if user_dict.get('role') is None:
                return None

            account_status = user_dict.get('account_status')

            user_dict['is_suspended'] = (
                account_status is not None
                and str(account_status).lower() in self.SUSPENDED_STATUSES
            )

            return user_dict

        except Exception as error:
            print(f"Database authentication query error: {error}")
            return None

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
