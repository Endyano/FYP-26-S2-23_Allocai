from db import Database


class WorkRuleEntity:

    @staticmethod
    def get_by_member(company_id, company_member_id):
        query = """
            SELECT *
            FROM part_time_work_rules
            WHERE company_id = %s
            AND company_member_id = %s
            AND rule_status = 'Active';
        """
        return Database.fetch_one(query, (company_id, company_member_id))