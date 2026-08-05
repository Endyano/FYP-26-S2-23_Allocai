import json

from google.genai import types

from entity.dispute_request_entity import DisputeRequestEntity
from gemini_client import get_gemini_client

_REVIEW_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {
            "type": "STRING",
            "description": "One or two plain-English sentences summarizing the dispute for a busy manager"
        },
        "recommendation": {
            "type": "STRING",
            "enum": ["approve", "reject", "uncertain"]
        },
        "rationale": {
            "type": "STRING",
            "description": "One or two sentences explaining the recommendation"
        },
    },
    "required": ["summary", "recommendation", "rationale"],
}


class AIDisputeControl:

    @staticmethod
    def suggest_resolution(company_id, dispute_request_id):
        dispute = DisputeRequestEntity.get_by_id(company_id, dispute_request_id)

        if not dispute:
            return {
                "success": False,
                "message": "Dispute request was not found."
            }

        if dispute.get("dispute_status") != "pending":
            return {
                "success": False,
                "message": "This dispute has already been resolved."
            }

        recorded_hours = dispute.get("hours_worked")
        requested_hours = dispute.get("requested_hours")
        difference = None
        if recorded_hours is not None:
            difference = round(float(requested_hours) - float(recorded_hours), 2)

        prompt = f"""A staff member has disputed the hours recorded for a completed task.
This is advisory only — a human manager makes the final decision.

Staff member: {dispute.get('full_name')}
Task: {dispute.get('task_title') or 'Unknown task'}
System-recorded hours: {recorded_hours if recorded_hours is not None else 'not recorded'}
Hours claimed by staff: {requested_hours}
Difference: {difference if difference is not None else 'unknown'} hours
Staff member's stated reason: {dispute.get('reason')}

Summarize this dispute for a manager who has not read it yet, and give a
recommendation. Favor "approve" when the claimed difference is small and
the reason is specific and plausible (e.g. a stated delay or extra task).
Favor "reject" when the reason is vague, generic, or the requested change
is large relative to the recorded hours with no clear explanation. Use
"uncertain" when the reason doesn't give enough information either way."""

        try:
            response = get_gemini_client().models.generate_content(
                model="gemini-flash-latest",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=_REVIEW_SCHEMA,
                ),
            )
            review = json.loads(response.text)
        except Exception:
            return {
                "success": False,
                "message": "Could not generate an AI review. Please try again."
            }

        return {
            "success": True,
            "review": {
                "summary": review.get("summary", ""),
                "recommendation": review.get("recommendation", "uncertain"),
                "rationale": review.get("rationale", "")
            }
        }
