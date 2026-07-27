import uuid

from db import Database


class InvitationEntity:

    @staticmethod
    def create(
        company_id,
        invited_email,
        invited_role,
        employee_type,
        department_id,
        invited_by
    ):
        # Generate a unique invitation token
        invitation_token = str(uuid.uuid4())

        query = """
            INSERT INTO company_invitations (
                company_id,
                invited_email,
                invited_role,
                employee_type,
                department_id,
                invited_by,
                invitation_token,
                invitation_status,
                expires_at,
                created_at
            )
            SELECT
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'Pending',
                NOW() + INTERVAL '7 days',
                NOW()
            WHERE NOT EXISTS (
                SELECT 1
                FROM company_invitations ci
                WHERE ci.company_id = %s
                AND LOWER(ci.invited_email) = LOWER(%s)
                AND ci.invitation_status = 'Pending'
                AND ci.expires_at > NOW()
            )
            AND NOT EXISTS (
                SELECT 1
                FROM company_members cm
                JOIN users u
                    ON u.user_id = cm.user_id
                WHERE cm.company_id = %s
                AND LOWER(u.email) = LOWER(%s)
                AND cm.member_status = 'Active'
            )
            AND (
                %s IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM departments d
                    WHERE d.company_id = %s
                    AND d.department_id = %s
                    AND d.department_status = 'Active'
                )
            )
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                invited_email,
                invited_role,
                employee_type,
                department_id,
                invited_by,
                invitation_token,
                company_id,
                invited_email,
                company_id,
                invited_email,
                department_id,
                company_id,
                department_id
            )
        )