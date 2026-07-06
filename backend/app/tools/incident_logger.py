import datetime

from pydantic import validate_call

from app.app_utils.tool_decorator import tool

INCIDENT_LOG: dict[str, list[dict[str, str]]] = {}


@tool
@validate_call
def log_incident(renter_id: str, description: str) -> str:
    """Appends a timestamped entry to an in-memory incident log per renter.

    Args:
        renter_id: A unique identifier for the renter.
        description: A detailed description of the incident.

    Returns:
        A confirmation message containing the total incidents count.
    """
    # Strict ISO-8601 timestamp format
    timestamp = datetime.datetime.now().isoformat()
    r_id = renter_id.strip()

    if r_id not in INCIDENT_LOG:
        INCIDENT_LOG[r_id] = []

    INCIDENT_LOG[r_id].append({"timestamp": timestamp, "description": description})

    return f"Successfully logged incident for Renter '{r_id}' at {timestamp}. Total incidents logged: {len(INCIDENT_LOG[r_id])}."
