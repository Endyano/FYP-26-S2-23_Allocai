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