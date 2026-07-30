from db import Database


class AvailabilityEntity:

    @staticmethod
    def is_available_for_task(company_id, company_member_id, task_date, start_time, end_time):
        any_schedule_query = """
            SELECT availability_id
            FROM availability_schedules
            WHERE company_id = %s
            AND company_member_id = %s
            AND available_date = %s
            LIMIT 1;
        """

        any_schedule = Database.fetch_one(
            any_schedule_query,
            (company_id, company_member_id, task_date)
        )

        if not any_schedule:
            return None

        available_query = """
            SELECT availability_id
            FROM availability_schedules
            WHERE company_id = %s
            AND company_member_id = %s
            AND available_date = %s
            AND start_time <= %s
            AND end_time >= %s
            AND availability_status = 'available'
            LIMIT 1;
        """

        return Database.fetch_one(
            available_query,
            (company_id, company_member_id, task_date, start_time, end_time)
        ) is not None

    @staticmethod
    def create(
        company_id,
        company_member_id,
        available_date,
        start_time,
        end_time,
        availability_status="available"
    ):
        query = """
            INSERT INTO availability_schedules (
                company_id,
                company_member_id,
                available_date,
                start_time,
                end_time,
                availability_status,
                created_at,
                updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                company_id,
                company_member_id,
                available_date,
                start_time,
                end_time,
                availability_status
            )
        )

    @staticmethod
    def get_by_member(company_id, company_member_id):
        query = """
            SELECT *
            FROM availability_schedules
            WHERE company_id = %s
            AND company_member_id = %s
            AND available_date >= CURRENT_DATE
            ORDER BY available_date ASC, start_time ASC;
        """
        return Database.fetch_all(query, (company_id, company_member_id))

    @staticmethod
    def delete(company_id, company_member_id, availability_id):
        query = """
            DELETE FROM availability_schedules
            WHERE company_id = %s
            AND company_member_id = %s
            AND availability_id = %s
            RETURNING availability_id;
        """
        return Database.execute(query, (company_id, company_member_id, availability_id))

    @staticmethod
    def update_schedule(
        company_id,
        company_member_id,
        availability_id,
        data
    ):
        query = """
            UPDATE availability_schedules
            SET
                available_date = COALESCE(
                    %s,
                    available_date
                ),
                start_time = COALESCE(
                    %s,
                    start_time
                ),
                end_time = COALESCE(
                    %s,
                    end_time
                ),
                availability_status = COALESCE(
                    %s,
                    availability_status
                )
            WHERE company_id = %s
            AND company_member_id = %s
            AND availability_id = %s
            RETURNING *;
        """

        return Database.execute(
            query,
            (
                data.get("available_date"),
                data.get("start_time"),
                data.get("end_time"),
                data.get("availability_status"),
                company_id,
                company_member_id,
                availability_id
            )
        )