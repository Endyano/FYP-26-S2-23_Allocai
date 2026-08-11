import uuid

from db import Database
from psycopg2.extras import RealDictCursor


class RoleEntity:

    SYSTEM_ROLE_DESCRIPTIONS = {
        "company_admin": "Full administrative access to company settings, employees, departments, roles, and billing.",
        "manager": "Creates and assigns tasks, manages staff skillsets, and reviews cancellation and hour dispute requests.",
        "full_time_staff": "Full-time employee who views and completes assigned tasks and schedule.",
        "part_time_staff": "Part-time employee with a capped eligible-hours limit who views and completes assigned tasks.",
    }

    SYSTEM_ROLES = list(SYSTEM_ROLE_DESCRIPTIONS.keys())

    SYSTEM_ROLE_PERMISSIONS = {
        "company_admin": [
            "allocate_task",
            "configure_rules",
            "manage_billing",
            "manage_departments",
            "manage_roles",
            "manage_skillsets",
            "manage_staff",
            "review_requests",
            "view_reports",
        ],
        "manager": [
            "allocate_task",
            "manage_skillsets",
            "manage_staff",
            "review_requests",
            "view_reports",
        ],
        "full_time_staff": [],
        "part_time_staff": [],
    }

    @staticmethod
    def seed_system_roles(company_id):
        # Create the fixed set of system roles for a newly created company
        query = """
            INSERT INTO roles (
                role_id,
                company_id,
                role_name,
                role_description,
                is_system_role,
                created_at
            )
            VALUES (%s, %s, %s, %s, TRUE, NOW())
            ON CONFLICT (company_id, role_name) DO NOTHING
            RETURNING *;
        """

        permission_query = """
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT %s, permission_id
            FROM permissions
            WHERE permission_key = ANY(%s::text[])
            ON CONFLICT DO NOTHING
            RETURNING role_id;
        """

        created = []

        for role_name in RoleEntity.SYSTEM_ROLES:
            role = Database.execute(
                query,
                (
                    str(uuid.uuid4()),
                    company_id,
                    role_name,
                    RoleEntity.SYSTEM_ROLE_DESCRIPTIONS[role_name]
                )
            )

            if role:
                created.append(role)

                permission_keys = RoleEntity.SYSTEM_ROLE_PERMISSIONS.get(role_name, [])

                if permission_keys:
                    Database.execute(
                        permission_query,
                        (role["role_id"], permission_keys)
                    )

        return created

    @staticmethod
    def get_by_name(company_id, role_name):
        query = """
            SELECT role_id, company_id, role_name, is_system_role
            FROM roles
            WHERE company_id = %s
            AND LOWER(role_name) = LOWER(%s);
        """

        return Database.fetch_one(query, (company_id, role_name))

    @staticmethod
    def create(
        company_id,
        role_name,
        role_description=None
    ):
        # Generate the role UUID in Python
        role_id = str(uuid.uuid4())

        query = """
            INSERT INTO roles (
                role_id,
                company_id,
                role_name,
                role_description,
                is_system_role,
                created_at
            )
            SELECT
                %s,
                %s,
                %s,
                %s,
                FALSE,
                NOW()
            WHERE NOT EXISTS (
                SELECT 1
                FROM roles
                WHERE company_id = %s
                AND LOWER(role_name) = LOWER(%s)
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                role_id,
                company_id,
                role_name,
                role_description,
                company_id,
                role_name
            )
        )

    @staticmethod
    def get_by_company(company_id):
        # Get company roles and their assigned permissions
        query = """
            SELECT
                r.role_id,
                r.company_id,
                r.role_name,
                r.role_description,
                r.is_system_role,
                r.created_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'permission_id',
                            p.permission_id,
                            'permission_key',
                            p.permission_key,
                            'description',
                            p.description
                        )
                    ) FILTER (
                        WHERE p.permission_id IS NOT NULL
                    ),
                    '[]'::JSON
                ) AS permissions
            FROM roles r
            LEFT JOIN role_permissions rp
                ON rp.role_id = r.role_id
            LEFT JOIN permissions p
                ON p.permission_id = rp.permission_id
            WHERE r.company_id = %s
            GROUP BY
                r.role_id,
                r.company_id,
                r.role_name,
                r.role_description,
                r.is_system_role,
                r.created_at
            ORDER BY r.role_name ASC;
        """

        return Database.fetch_all(
            query,
            (company_id,)
        )

    @staticmethod
    def get_by_id(company_id, role_id):
        query = """
            SELECT
                r.role_id,
                r.company_id,
                r.role_name,
                r.role_description,
                r.is_system_role,
                r.created_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'permission_id',
                            p.permission_id,
                            'permission_key',
                            p.permission_key,
                            'description',
                            p.description
                        )
                    ) FILTER (
                        WHERE p.permission_id IS NOT NULL
                    ),
                    '[]'::JSON
                ) AS permissions
            FROM roles r
            LEFT JOIN role_permissions rp
                ON rp.role_id = r.role_id
            LEFT JOIN permissions p
                ON p.permission_id = rp.permission_id
            WHERE r.company_id = %s
            AND r.role_id = %s
            GROUP BY
                r.role_id,
                r.company_id,
                r.role_name,
                r.role_description,
                r.is_system_role,
                r.created_at;
        """

        return Database.fetch_one(
            query,
            (
                company_id,
                role_id
            )
        )

    @staticmethod
    def update(company_id, role_id, data):
        connection = None
        cursor = None

        try:
            connection = Database.get_connection()
            cursor = connection.cursor(
                cursor_factory=RealDictCursor
            )

            # Lock and check the role
            cursor.execute(
                """
                SELECT *
                FROM roles
                WHERE company_id = %s
                AND role_id = %s
                AND is_system_role = FALSE
                FOR UPDATE;
                """,
                (
                    company_id,
                    role_id
                )
            )

            existing_role = cursor.fetchone()

            if not existing_role:
                return None

            role_name = data.get("role_name")

            # Prevent duplicate role names
            if role_name:
                cursor.execute(
                    """
                    SELECT role_id
                    FROM roles
                    WHERE company_id = %s
                    AND LOWER(role_name) = LOWER(%s)
                    AND role_id != %s
                    LIMIT 1;
                    """,
                    (
                        company_id,
                        role_name,
                        role_id
                    )
                )

                if cursor.fetchone():
                    raise ValueError(
                        "Role name is already in use."
                    )

            # Update the role details
            cursor.execute(
                """
                UPDATE roles
                SET
                    role_name = COALESCE(
                        %s,
                        role_name
                    ),
                    role_description = COALESCE(
                        %s,
                        role_description
                    )
                WHERE company_id = %s
                AND role_id = %s;
                """,
                (
                    role_name,
                    data.get("role_description"),
                    company_id,
                    role_id
                )
            )

            permission_ids = data.get("permission_ids")

            # Replace permissions only when permission_ids is sent
            if permission_ids is not None:
                if permission_ids:
                    cursor.execute(
                        """
                        SELECT permission_id
                        FROM permissions
                        WHERE permission_id = ANY(%s::uuid[]);
                        """,
                        (permission_ids,)
                    )

                    valid_permissions = cursor.fetchall()

                    if len(valid_permissions) != len(permission_ids):
                        raise ValueError(
                            "One or more permissions are invalid."
                        )

                cursor.execute(
                    """
                    DELETE FROM role_permissions
                    WHERE role_id = %s;
                    """,
                    (role_id,)
                )

                for permission_id in permission_ids:
                    cursor.execute(
                        """
                        INSERT INTO role_permissions (
                            role_id,
                            permission_id
                        )
                        VALUES (%s, %s);
                        """,
                        (
                            role_id,
                            permission_id
                        )
                    )

            connection.commit()

        except Exception:
            if connection:
                connection.rollback()
            raise

        finally:
            if cursor:
                cursor.close()

            if connection:
                connection.close()

        return RoleEntity.get_by_id(
            company_id=company_id,
            role_id=role_id
        )

    @staticmethod
    def assign_to_member(
        company_id,
        company_member_id,
        role_id,
        assigned_by
    ):
        # A member holds exactly one role at a time, so validate the member
        # and role first -- if either is invalid we must not touch their
        # existing role.
        valid = Database.fetch_one(
            """
            SELECT cm.company_member_id
            FROM company_members cm
            JOIN roles r ON r.company_id = cm.company_id
            WHERE cm.company_id = %s
            AND cm.company_member_id = %s
            AND cm.member_status = 'active'
            AND r.role_id = %s;
            """,
            (company_id, company_member_id, role_id)
        )

        if not valid:
            return None

        # Replace any existing role(s) with the new one in a single
        # transaction, so the member is never left with zero roles.
        query = """
            WITH removed AS (
                DELETE FROM member_roles
                WHERE company_member_id = %s
            )
            INSERT INTO member_roles (
                company_member_id,
                role_id,
                assigned_by,
                assigned_at
            )
            VALUES (%s, %s, %s, NOW())
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_member_id,
                company_member_id,
                role_id,
                assigned_by
            )
        )