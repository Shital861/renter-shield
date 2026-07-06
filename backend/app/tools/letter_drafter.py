import datetime
from enum import StrEnum

from pydantic import validate_call

from app.app_utils.tool_decorator import tool


class ToneEnum(StrEnum):
    friendly = "friendly"
    formal = "formal"
    legal_notice = "legal_notice"


DISCLAIMER = (
    "\n\nThis is legal information, not legal advice. "
    "Consult a licensed attorney for your specific situation."
)


@tool
@validate_call
def draft_letter(
    issue: str,
    tone: ToneEnum,
    renter_name: str,
    landlord_name: str,
    issue_description: str,
) -> str:
    """Generates a demand letter to a landlord regarding a rental issue.

    Args:
        issue: The core issue (e.g., 'Unresolved mold in bathroom').
        tone: The tone of the letter (friendly, formal, legal_notice).
        renter_name: The name of the renter.
        landlord_name: The name of the landlord or property manager.
        issue_description: A detailed description of the problem.

    Returns:
        The drafted demand letter with a legal disclaimer.
    """
    date_str = datetime.date.today().strftime("%B %d, %Y")
    tone_key = tone.value

    if tone_key == "friendly":
        salutation = "Dear"
        body = (
            f"I am writing to bring your attention to an issue regarding {issue}. "
            f"Specifically: {issue_description}.\n\n"
            f"I enjoy living here and appreciate your help in resolving this matter quickly. "
            f"Please let me know when we can schedule a time to address this. Thank you!"
        )
        closing = "Best regards,\n\n" + renter_name
    elif tone_key == "formal":
        salutation = "Dear Mr./Ms./Mx."
        body = (
            f"This letter serves as formal notice regarding the following issue: {issue}.\n\n"
            f"Description of the issue: {issue_description}.\n\n"
            f"Please be advised that this matter requires prompt attention. I request that you contact me "
            f"within 7 business days to confirm when repairs or actions will be initiated to resolve this "
            f"satisfactorily. Thank you for your cooperation."
        )
        closing = "Sincerely,\n\n" + renter_name
    else:  # legal_notice
        salutation = "FORMAL LEGAL NOTICE"
        body = (
            f"TO: {landlord_name}\n"
            f"FROM: {renter_name}\n"
            f"DATE: {date_str}\n\n"
            f"RE: NOTICE OF LEASE/LAW VIOLATION & DEMAND FOR CURE\n\n"
            f"Please accept this as formal written notice regarding {issue}.\n\n"
            f"FACTUAL DESCRIPTION: {issue_description}.\n\n"
            f"DEMAND: Under applicable state laws and the terms of our lease agreement, you are legally obligated "
            f"to maintain the premises in a habitable condition and/or comply with lease provisions. Demand is hereby "
            f"made that you cure the aforementioned violation immediately upon receipt of this notice.\n\n"
            f"Failure to address this matter promptly may result in further legal action, including but not limited "
            f"to reporting violations to local housing authorities, rent withholding, or filing a claim in small "
            f"claims court. We reserve all rights under the law."
        )
        closing = "Respectfully submitted,\n\n" + renter_name

    header = f"Date: {date_str}\nTo: {landlord_name}\nFrom: {renter_name}\n\n"

    if tone_key == "legal_notice":
        letter = f"{salutation}\n\n{body}"
    else:
        letter = f"{header}{salutation} {landlord_name},\n\n{body}\n\n{closing}"

    return letter + DISCLAIMER
