import os

SUPABASE_CONFIG = {
    "dbname": os.getenv("SUPABASE_DB_NAME", "postgres"),
    "user": os.getenv("SUPABASE_DB_USER"),
    "password": os.getenv("SUPABASE_DB_PASSWORD"),
    "host": os.getenv("SUPABASE_DB_HOST"),
    "port": os.getenv("SUPABASE_DB_PORT", "6543"),
}

LOCAL_CONFIG = {
    "dbname": os.getenv("LOCAL_DB_NAME", "task_allocation_db"),
    "user": os.getenv("LOCAL_DB_USER", "postgres"),
    "password": os.getenv("LOCAL_DB_PASSWORD"),
    "host": os.getenv("LOCAL_DB_HOST", "localhost"),
    "port": os.getenv("LOCAL_DB_PORT", "5432"),
}
