"""
Seed script — run from src/login/ directory:
    python seed.py

Populates the database with fake Department Staff, Casual Staff, and task allocations.
All accounts use password: password123
"""

import os
import sys
import uuid
import random
from datetime import date, timedelta, time

import psycopg2
from psycopg2.extras import Json, RealDictCursor
from dotenv import load_dotenv

load_dotenv()
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from models.db_config import SUPABASE_CONFIG

# ── Fake data ────────────────────────────────────────────────────────────────

DEPT_STAFF = [
    {'full_name': 'Alice Tan',    'email': 'alice.tan@allocai.com',    'dept': 'Human Resources'},
    {'full_name': 'Bob Lee',      'email': 'bob.lee@allocai.com',      'dept': 'Information Technology'},
    {'full_name': 'Carol Ng',     'email': 'carol.ng@allocai.com',     'dept': 'Finance'},
    {'full_name': 'David Wong',   'email': 'david.wong@allocai.com',   'dept': 'Marketing'},
]

CASUAL_STAFF = [
    {'full_name': 'Emma Chen',    'email': 'emma.chen@casual.com',    'max_hours': 24},
    {'full_name': 'James Lim',    'email': 'james.lim@casual.com',    'max_hours': 16},
    {'full_name': 'Sophia Park',  'email': 'sophia.park@casual.com',  'max_hours': 32},
    {'full_name': 'Ryan Koh',     'email': 'ryan.koh@casual.com',     'max_hours': 20},
    {'full_name': 'Mia Zhang',    'email': 'mia.zhang@casual.com',    'max_hours': 16},
    {'full_name': 'Ethan Goh',    'email': 'ethan.goh@casual.com',    'max_hours': 24},
    {'full_name': 'Olivia Sim',   'email': 'olivia.sim@casual.com',   'max_hours': 32},
    {'full_name': 'Lucas Tay',    'email': 'lucas.tay@casual.com',    'max_hours': 16},
]

TASK_NAMES = [
    'Data Entry', 'File Sorting', 'Reception Cover', 'Event Setup',
    'Stock Count', 'Report Compilation', 'Customer Support', 'IT Support',
    'Document Scanning', 'Delivery Assistance', 'Meeting Room Setup',
    'Mail Distribution', 'Inventory Check', 'Office Supervision',
]

PRIORITIES = ['Low', 'Medium', 'High']
STATUSES   = ['Pending', 'Approved', 'Completed']

PASSWORD = 'password123'

# ── Helpers ──────────────────────────────────────────────────────────────────

def get_connection():
    return psycopg2.connect(**SUPABASE_CONFIG)


def email_exists(cursor, email):
    cursor.execute("SELECT id FROM public.profiles WHERE LOWER(email) = %s;", (email.lower(),))
    return cursor.fetchone() is not None


def create_auth_user(cursor, user_id, email, full_name, password):
    cursor.execute(
        """
        INSERT INTO auth.users (
            id, aud, role, email, encrypted_password,
            raw_app_meta_data, raw_user_meta_data,
            email_confirmed_at, created_at, updated_at
        )
        VALUES (%s, 'authenticated', 'authenticated', %s, %s, %s, %s, NOW(), NOW(), NOW());
        """,
        (
            user_id,
            email,
            password,
            Json({"provider": "email", "providers": ["email"]}),
            Json({"password": password, "email_verified": True, "full_name": full_name}),
        )
    )


def seed_dept_staff(cursor):
    print("\n── Seeding Department Staff ──")
    dept_ids = {}

    for staff in DEPT_STAFF:
        if email_exists(cursor, staff['email']):
            print(f"  SKIP  {staff['email']} (already exists)")
            # Fetch existing id for task allocation use
            cursor.execute("SELECT id FROM public.profiles WHERE LOWER(email) = %s;", (staff['email'].lower(),))
            row = cursor.fetchone()
            if row:
                dept_ids[staff['email']] = str(row['id'])
            continue

        user_id = str(uuid.uuid4())
        create_auth_user(cursor, user_id, staff['email'], staff['full_name'], PASSWORD)

        cursor.execute(
            """
            UPDATE public.profiles
            SET full_name = %s, role = 'Department Staff', department_name = %s,
                max_weekly_hours = 40, allocated_hours = 0
            WHERE id = %s
            RETURNING id;
            """,
            (staff['full_name'], staff['dept'], user_id)
        )
        result = cursor.fetchone()
        if result:
            dept_ids[staff['email']] = str(result['id'])
            print(f"  OK    {staff['full_name']} ({staff['dept']})")
        else:
            print(f"  WARN  Profile not auto-created for {staff['email']} — trigger may be missing")

    return dept_ids


def seed_casual_staff(cursor):
    print("\n── Seeding Casual Staff ──")
    casual_ids = {}

    for staff in CASUAL_STAFF:
        if email_exists(cursor, staff['email']):
            print(f"  SKIP  {staff['email']} (already exists)")
            cursor.execute("SELECT id FROM public.profiles WHERE LOWER(email) = %s;", (staff['email'].lower(),))
            row = cursor.fetchone()
            if row:
                casual_ids[staff['email']] = str(row['id'])
            continue

        user_id = str(uuid.uuid4())
        create_auth_user(cursor, user_id, staff['email'], staff['full_name'], PASSWORD)

        cursor.execute(
            """
            UPDATE public.profiles
            SET full_name = %s, role = 'Casual Staff',
                max_weekly_hours = %s, allocated_hours = 0, is_suspended = false
            WHERE id = %s
            RETURNING id;
            """,
            (staff['full_name'], staff['max_hours'], user_id)
        )
        result = cursor.fetchone()
        if result:
            casual_ids[staff['email']] = str(result['id'])
            print(f"  OK    {staff['full_name']} (max {staff['max_hours']} hrs/wk)")
        else:
            print(f"  WARN  Profile not auto-created for {staff['email']} — trigger may be missing")

    return casual_ids


def seed_task_allocations(cursor, dept_ids, casual_ids):
    print("\n── Seeding Task Allocations ──")

    dept_id_list   = list(dept_ids.values())
    casual_id_list = list(casual_ids.values())

    if not dept_id_list or not casual_id_list:
        print("  SKIP  No dept or casual staff IDs available.")
        return

    today = date.today()
    count = 0

    for i in range(20):
        dept_id   = random.choice(dept_id_list)
        staff_id  = random.choice(casual_id_list)
        task_name = random.choice(TASK_NAMES)
        priority  = random.choice(PRIORITIES)
        status    = random.choice(STATUSES)

        # Mix of past, present, future dates
        offset    = random.randint(-14, 14)
        task_date = today + timedelta(days=offset)

        start_hour = random.randint(8, 15)
        duration   = random.randint(2, 5)
        start_time = time(start_hour, 0)
        end_time   = time(start_hour + duration, 0)

        cursor.execute(
            """
            INSERT INTO public.task_allocations
                (department_id, staff_id, task_name, description, task_date,
                 start_time, end_time, priority, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (
                dept_id, staff_id, task_name,
                f'{task_name} task assigned by department.',
                task_date, start_time, end_time, priority, status
            )
        )
        count += 1

    print(f"  OK    {count} task allocations created")


def update_allocated_hours(cursor):
    """Recalculate allocated_hours for each casual staff based on task_allocations."""
    print("\n── Updating allocated_hours ──")
    cursor.execute(
        """
        UPDATE public.profiles p
        SET allocated_hours = (
            SELECT COALESCE(SUM(
                EXTRACT(EPOCH FROM (end_time::interval - start_time::interval)) / 3600
            ), 0)
            FROM public.task_allocations
            WHERE staff_id = p.id
            AND status != 'Cancelled'
        )
        WHERE p.role = 'Casual Staff';
        """
    )
    print("  OK    allocated_hours synced")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Connecting to database...")
    connection = get_connection()
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    try:
        dept_ids   = seed_dept_staff(cursor)
        casual_ids = seed_casual_staff(cursor)
        seed_task_allocations(cursor, dept_ids, casual_ids)
        update_allocated_hours(cursor)

        connection.commit()
        print("\nDone! All seed data committed.")
        print("\nLogin credentials (all use password: password123)")
        print("─" * 50)
        for s in DEPT_STAFF:
            print(f"  [Dept Staff]    {s['email']}")
        for s in CASUAL_STAFF:
            print(f"  [Casual Staff]  {s['email']}")

    except Exception as e:
        connection.rollback()
        print(f"\nERROR: {e}")
        raise

    finally:
        cursor.close()
        connection.close()


if __name__ == '__main__':
    main()
