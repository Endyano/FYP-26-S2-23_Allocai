import json
import os
from datetime import datetime, timezone

from google import genai
from google.genai import types

from entity.department_entity import DepartmentEntity
from entity.skillset_entity import SkillsetEntity

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return _client


_DRAFT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "task_title": {"type": "STRING"},
        "task_description": {"type": "STRING"},
        "task_date": {
            "type": "STRING",
            "description": "ISO date YYYY-MM-DD, resolved from any relative date in the request"
        },
        "start_time": {"type": "STRING", "description": "24-hour HH:MM"},
        "end_time": {"type": "STRING", "description": "24-hour HH:MM"},
        "priority_level": {
            "type": "STRING",
            "enum": ["low", "medium", "high"]
        },
        "department_name": {
            "type": "STRING",
            "nullable": True,
            "description": "Best match from the provided department list, or null if none fits"
        },
        "skillset_name": {
            "type": "STRING",
            "nullable": True,
            "description": "Best match from the provided skillset list, or null if none fits"
        },
    },
    "required": [
        "task_title",
        "task_description",
        "task_date",
        "start_time",
        "end_time",
        "priority_level"
    ],
}


class AITaskControl:

    @staticmethod
    def draft_task(company_id, description):
        if not description or not description.strip():
            return {
                "success": False,
                "message": "A task description is required."
            }

        departments = DepartmentEntity.get_by_company(company_id)
        skillsets = SkillsetEntity.get_by_company(company_id)

        department_names = [d["department_name"] for d in departments]
        skillset_names = [s["skillset_name"] for s in skillsets]

        today = datetime.now(timezone.utc)
        weekday = today.strftime("%A")

        prompt = f"""Today is {today.strftime('%Y-%m-%d')} ({weekday}).

Known departments: {', '.join(department_names) or 'none'}
Known skillsets: {', '.join(skillset_names) or 'none'}

Manager's request: {description.strip()}

Extract a structured task draft from the request above. Resolve any
relative dates (e.g. "tomorrow", "next Monday", "this Friday") against
today's date. If no time is mentioned, pick sensible business hours for
the described work. Only choose a department_name or skillset_name if
it clearly matches one of the known lists above; otherwise leave it null."""

        try:
            response = _get_client().models.generate_content(
                model="gemini-flash-latest",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=_DRAFT_SCHEMA,
                ),
            )
            draft = json.loads(response.text)
        except Exception:
            return {
                "success": False,
                "message": "Could not generate a task draft. Please try again."
            }

        department_id = None
        department_name = draft.get("department_name")
        if department_name:
            for d in departments:
                if d["department_name"].strip().lower() == department_name.strip().lower():
                    department_id = d["department_id"]
                    break

        required_skillset_id = None
        skillset_name = draft.get("skillset_name")
        if skillset_name:
            for s in skillsets:
                if s["skillset_name"].strip().lower() == skillset_name.strip().lower():
                    required_skillset_id = s["skillset_id"]
                    break

        return {
            "success": True,
            "draft": {
                "task_title": draft.get("task_title", ""),
                "task_description": draft.get("task_description", ""),
                "task_date": draft.get("task_date", ""),
                "start_time": draft.get("start_time", ""),
                "end_time": draft.get("end_time", ""),
                "priority_level": draft.get("priority_level", "medium"),
                "department_id": department_id,
                "required_skillset_id": required_skillset_id
            }
        }
