from enum import StrEnum

from pydantic import validate_call

from app.app_utils.tool_decorator import tool
from app.data.tenant_rights import TENANT_RIGHTS


class StateEnum(StrEnum):
    CA = "CA"
    NY = "NY"
    TX = "TX"
    FL = "FL"
    WA = "WA"


class IssueEnum(StrEnum):
    heating = "heating"
    mold = "mold"
    eviction = "eviction"
    entry_notice = "entry_notice"
    deposit = "deposit"


DISCLAIMER = (
    "\n\nThis is legal information, not legal advice. "
    "Consult a licensed attorney for your specific situation."
)


@tool
@validate_call
def check_tenant_rights(state: StateEnum, issue: IssueEnum) -> str:
    """Looks up applicable tenant protection laws for a given US state and issue type.

    Args:
        state: The US state to look up (CA, NY, TX, FL, WA).
        issue: The issue type (heating, mold, eviction, entry_notice, deposit).

    Returns:
        A string describing the applicable tenant protection laws, containing
        State, Issue, Law Details, and a legal disclaimer.
    """
    state_code = state.value
    issue_key = issue.value

    laws = TENANT_RIGHTS[state_code][issue_key]

    return (
        f"State: {state_code}\n"
        f"Issue: {issue_key.replace('_', ' ')}\n"
        f"Law Details: {laws}"
        f"{DISCLAIMER}"
    )
