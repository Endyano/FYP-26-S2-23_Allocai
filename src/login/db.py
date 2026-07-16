import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()


class Database:

    @staticmethod
    def get_connection():
        return psycopg2.connect(
            dbname=os.getenv("DB_NAME", "postgres"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT", "5432")
        )

    @staticmethod
    def fetch_all(query, params=None):
        connection = None
        cursor = None

        try:
            connection = Database.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params or ())
            return cursor.fetchall()

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def fetch_one(query, params=None):
        connection = None
        cursor = None

        try:
            connection = Database.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params or ())
            return cursor.fetchone()

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    @staticmethod
    def execute(query, params=None):
        connection = None
        cursor = None

        try:
            connection = Database.get_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params or ())
            result = cursor.fetchone()
            connection.commit()
            return result

        except Exception:
            if connection:
                connection.rollback()
            raise

        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()