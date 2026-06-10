import psycopg2
from psycopg2.extras import RealDictCursor

class UserAccount:

    def __init__(self):
        self.connection_config = {
         "dbname": "postgres",
         "user": "postgres.wmuqbyzzagrdpflhstay",
         "password": "fypsql26s223",
         "host": "aws-1-ap-southeast-2.pooler.supabase.com",
         "port": "6543"
}
        
    def get_connection(self):
        return psycopg2.connect(**self.connection_config)

    def verify(self, username, password, role):
        # 1. Map incoming lowercase route parameters to explicit database strings
        role_mapping = {
            'manager': 'Manager',
            'department': 'Department Staff',
            'casual_staff': 'Casual Staff'
        }
        
        db_role = role_mapping.get(role)
        if not db_role:
            return None

        connection = None
        cursor = None
        
        try:
            # 2. Establish connection with Dict Cursor
            connection = psycopg2.connect(**self.connection_config)
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT p.id, p.full_name, p.email, p.role 
                FROM auth.users u
                JOIN public.profiles p ON u.id = p.id
                WHERE p.email = %s AND u.raw_user_meta_data->>'password' = %s AND p.role = %s;
            """
            
            cursor.execute(query, (username, password, db_role))
            user = cursor.fetchone()
            
            if user:
                reverse_mapping = {v: k for k, v in role_mapping.items()}
                user_dict = dict(user)
                user_dict['role'] = reverse_mapping.get(user_dict['role'])
                return user_dict
                
            return None

        except Exception as error:
            print(f"Database authentication query error: {error}")
            return None
            
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
