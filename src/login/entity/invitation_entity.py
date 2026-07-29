import uuid

from db import Database


class InvitationEntity:

    @staticmethod
    def create(
        company_id,
        invited_email,
        invited_role_id,
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
                invited_role_id,
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
                'pending',
                NOW() + INTERVAL '7 days',
                NOW()
            WHERE NOT EXISTS (
                SELECT 1
                FROM company_invitations ci
                WHERE ci.company_id = %s
                AND LOWER(ci.invited_email) = LOWER(%s)
                AND ci.invitation_status = 'pending'
                AND ci.expires_at > NOW()
            )
            AND NOT EXISTS (
                SELECT 1
                FROM company_members cm
                JOIN users u
                    ON u.user_id = cm.user_id
                WHERE cm.company_id = %s
                AND LOWER(u.email) = LOWER(%s)
                AND cm.member_status = 'active'
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
                invited_role_id,
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

    @staticmethod
    def get_by_token(invitation_token):
        query = """
            SELECT
                ci.invitation_id,
                ci.company_id,
                ci.invited_email,
                ci.invited_role_id,
                ci.employee_type,
                ci.department_id,
                ci.invited_by,
                ci.invitation_status,
                ci.expires_at,
                r.role_name,
                c.company_name
            FROM company_invitations ci
            JOIN roles r
                ON r.role_id = ci.invited_role_id
            JOIN companies c
                ON c.company_id = ci.company_id
            WHERE ci.invitation_token = %s;
        """
        return Database.fetch_one(query, (invitation_token,))

    @staticmethod
    def mark_accepted(invitation_id, accepted_by):
        query = """
            UPDATE company_invitations
            SET
                invitation_status = 'accepted',
                accepted_by = %s,
                accepted_at = NOW()
            WHERE invitation_id = %s
            RETURNING *;
        """
        return Database.execute(query, (accepted_by, invitation_id))