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
            AND availability_status = 'Available'
            LIMIT 1;
        """

        return Database.fetch_one(
            available_query,
            (company_id, company_member_id, task_date, start_time, end_time)
        ) is not None