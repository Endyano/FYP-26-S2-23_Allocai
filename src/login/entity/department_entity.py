from db import Database


class DepartmentEntity:

    @staticmethod
    def create(
        company_id,
        department_name,
        department_description=None
    ):
        # Create a department if the name is not already used
        query = """
            INSERT INTO departments (
                company_id,
                department_name,
                department_description,
                department_status,
                created_at,
                updated_at
            )
            SELECT
                %s,
                %s,
                %s,
                'Active',
                NOW(),
                NOW()
            WHERE NOT EXISTS (
                SELECT 1
                FROM departments
                WHERE company_id = %s
                AND LOWER(department_name) = LOWER(%s)
                AND department_status != 'Deleted'
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                department_name,
                department_description,
                company_id,
                department_name
            )
        )
    
    @staticmethod
    def get_by_company(company_id):
        # Get departments belonging to the company
        query = """
            SELECT
                department_id,
                company_id,
                department_name,
                department_description,
                department_status,
                created_at,
                updated_at
            FROM departments
            WHERE company_id = %s
            AND department_status != 'Deleted'
            ORDER BY department_name ASC;
        """

        return Database.fetch_all(
            query,
            (company_id,)
        )

@staticmethod
def get_by_id(company_id, department_id):
    # Get one department belonging to the company
    query = """
        SELECT *
        FROM departments
        WHERE company_id = %s
        AND department_id = %s
        AND department_status != 'Deleted';
    """

    return Database.fetch_one(
        query,
        (
            company_id,
            department_id
        )
    )

    @staticmethod
    def update(company_id, department_id, data):
        # Update the department
        query = """
            UPDATE departments
            SET
                department_name = COALESCE(
                    %s,
                    department_name
                ),
                department_description = COALESCE(
                    %s,
                    department_description
                ),
                department_status = COALESCE(
                    %s,
                    department_status
                ),
                updated_at = NOW()
            WHERE company_id = %s
            AND department_id = %s
            AND department_status != 'Deleted'
            AND NOT EXISTS (
                SELECT 1
                FROM departments other_department
                WHERE other_department.company_id = %s
                AND LOWER(other_department.department_name)
                    = LOWER(%s)
                AND other_department.department_id != %s
                AND other_department.department_status != 'Deleted'
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                data.get("department_name"),
                data.get("department_description"),
                data.get("department_status"),
                company_id,
                department_id,
                company_id,
                data.get("department_name"),
                department_id
            )
        )

    @staticmethod
    def delete(company_id, department_id):
        # Soft-delete a department with no active tasks
        query = """
            UPDATE departments
            SET
                department_status = 'Deleted',
                updated_at = NOW()
            WHERE company_id = %s
            AND department_id = %s
            AND department_status != 'Deleted'
            AND NOT EXISTS (
                SELECT 1
                FROM tasks
                WHERE tasks.company_id = departments.company_id
                AND tasks.department_id = departments.department_id
                AND tasks.task_status NOT IN (
                    'Completed',
                    'Cancelled'
                )
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                department_id
            )
        )