import psycopg2
from psycopg2.extras import RealDictCursor

def verify_database_connection():
    # Your exact project configuration parameters
    connection_config = {
        "dbname": "postgres",
        "user": "postgres.wmuqbyzzagrdpflhstay",
        "password": "fypsql26s223",
        "host": "aws-1-ap-southeast-2.pooler.supabase.com",
        "port": "6543"
    }
    
    connection = None
    cursor = None
    
    print("🔌 Attempting to establish a connection to Supabase...")
    
    try:
        # Try to connect to the cloud hosting provider
        connection = psycopg2.connect(**connection_config)
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        
        # Execute a lightweight sanity query to prove the server responds
        cursor.execute("SELECT 1 AS connection_status;")
        result = cursor.fetchone()
        
        print("\n---CONNECTION SUCCESSFUL ---")
        print(f"Database Server Response: {dict(result)}")
        print("Your Python backend is perfectly connected to the database!")
        print("--------------------------------\n")
        
    except Exception as error:
        print("\n---CONNECTION FAILED ---")
        print(f"Error Details: {error}")
        print("\nPossible issues to check:")
        print("1. Are you connected to the internet?")
        print("2. Is your IP address blocked by a campus/corporate firewall blocking port 6543?")
        print("3. Is the password ('fypsql26s223') still active on your Supabase dashboard?")
        print("----------------------------\n")
        
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

if __name__ == "__main__":
    verify_database_connection()