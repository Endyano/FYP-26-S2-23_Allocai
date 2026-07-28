from db import Database


class SkillsetEntity:

    @staticmethod
    def get_by_id(company_id, skillset_id):
        query = """
            SELECT *
            FROM skillsets
            WHERE company_id = %s
            AND skillset_id = %s
            AND skillset_status = 'Active';
        """
        return Database.fetch_one(query, (company_id, skillset_id))

    @staticmethod
    def assign_to_staff(company_id, company_member_id, skillset_id, assigned_by):
        query = """
            INSERT INTO staff_skillsets (
                company_id,
                company_member_id,
                skillset_id,
                assigned_by,
                assigned_at
            )
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING *;
        """
        return Database.execute(
            query,
            (company_id, company_member_id, skillset_id, assigned_by)
        )

    @staticmethod
    def update_staff_skillset(company_id, staff_skillset_id, skillset_id):
        query = """
            UPDATE staff_skillsets
            SET skillset_id = %s
            WHERE company_id = %s
            AND staff_skillset_id = %s
            RETURNING *;
        """
        return Database.execute(query, (skillset_id, company_id, staff_skillset_id))

    @staticmethod
    def staff_has_skillset(company_id, company_member_id, skillset_id):
        query = """
            SELECT staff_skillset_id
            FROM staff_skillsets
            WHERE company_id = %s
            AND company_member_id = %s
            AND skillset_id = %s
            LIMIT 1;
        """
        return Database.fetch_one(
            query,
            (company_id, company_member_id, skillset_id)
        ) is not None

    @staticmethod
    def create(
        company_id,
        skillset_name,
        skillset_description=None
    ):
        # Create a skillset if the name is not already used
        query = """
            INSERT INTO skillsets (
                company_id,
                skillset_name,
                skillset_description,
                skillset_status,
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
                FROM skillsets
                WHERE company_id = %s
                AND LOWER(skillset_name) = LOWER(%s)
                AND skillset_status != 'Deleted'
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                skillset_name,
                skillset_description,
                company_id,
                skillset_name
            )
        )

    @staticmethod
    def get_by_company(company_id):
        # Get available skillsets belonging to the company
        query = """
            SELECT
                skillset_id,
                company_id,
                skillset_name,
                skillset_description,
                skillset_status,
                created_at,
                updated_at
            FROM skillsets
            WHERE company_id = %s
            AND skillset_status != 'Deleted'
            ORDER BY skillset_name ASC;
        """

        return Database.fetch_all(
            query,
            (company_id,)
        )

    @staticmethod
    def delete(company_id, skillset_id):
        # Soft-delete a skillset with no active tasks
        query = """
            UPDATE skillsets
            SET
                skillset_status = 'Deleted',
                updated_at = NOW()
            WHERE company_id = %s
            AND skillset_id = %s
            AND skillset_status != 'Deleted'
            AND NOT EXISTS (
                SELECT 1
                FROM tasks
                WHERE tasks.company_id = skillsets.company_id
                AND tasks.required_skillset_id = skillsets.skillset_id
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
                skillset_id
            )
        )