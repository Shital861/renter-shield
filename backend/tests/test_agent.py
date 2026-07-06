import datetime
from typing import cast

import pytest
from pydantic import ValidationError

from app.data.carts import CARTS
from app.data.voucher_store import VOUCHER_STORE
from app.tools.checkout import process_checkout
from app.tools.incident_logger import INCIDENT_LOG, log_incident
from app.tools.letter_drafter import ToneEnum, draft_letter
from app.tools.rights_checker import IssueEnum, StateEnum, check_tenant_rights
from app.tools.voucher_redeemer import redeem_voucher


@pytest.fixture(autouse=True)
def reset_data_stores():
    """Resets global in-memory state stores before each test to ensure test isolation."""
    for code in VOUCHER_STORE:
        VOUCHER_STORE[code]["redeemed"] = False
        VOUCHER_STORE[code]["renter_id"] = None
    INCIDENT_LOG.clear()

    # Reset CARTS
    CARTS["cart_001"]["renter_id"] = "renter_123"
    CARTS["cart_001"]["order_total"] = 150.0
    CARTS["cart_002"]["renter_id"] = "renter_456"
    CARTS["cart_002"]["order_total"] = 300.0


# --- Tests for redeem_voucher ---


def test_redeem_voucher_success() -> None:
    res = redeem_voucher("LEGALAID50", "renter_123")
    assert "Success" in res
    assert "LEGALAID50" in res
    assert "renter_123" in res
    assert VOUCHER_STORE["LEGALAID50"]["redeemed"] is True
    assert VOUCHER_STORE["LEGALAID50"]["renter_id"] == "renter_123"


def test_redeem_voucher_twice_same_renter_fails() -> None:
    redeem_voucher("LEGALAID50", "renter_123")
    res = redeem_voucher("LEGALAID50", "renter_123")
    assert "Error" in res
    assert "already been redeemed" in res


def test_redeem_voucher_twice_different_renter_fails() -> None:
    redeem_voucher("LEGALAID50", "renter_123")
    res = redeem_voucher("LEGALAID50", "renter_456")
    assert "Error" in res
    assert "already been redeemed" in res


def test_redeem_voucher_unknown_code_fails() -> None:
    res = redeem_voucher("UNKNOWN_CODE", "renter_123")
    assert "Error: Invalid voucher code" in res


def test_redeem_voucher_case_insensitive() -> None:
    res = redeem_voucher("legalaid50", "renter_123")
    assert "Success" in res
    assert VOUCHER_STORE["LEGALAID50"]["redeemed"] is True


def test_voucher_code_secrecy() -> None:
    # Ensure tool output does not disclose other active voucher codes in the system
    res = redeem_voucher("INVALIDCODE", "renter_123")
    assert "LEGALAID50" not in res
    assert "FIRSTMONTHFREE" not in res
    assert "WELCOME100" not in res


# --- Tests for check_tenant_rights ---


def test_check_tenant_rights_invalid_state() -> None:
    # Pydantic validation should block invalid state enums
    with pytest.raises(ValidationError) as excinfo:
        check_tenant_rights(cast(StateEnum, "XX"), cast(IssueEnum, "heating"))
    assert "Input should be 'CA', 'NY', 'TX', 'FL' or 'WA'" in str(excinfo.value)


def test_check_tenant_rights_invalid_issue() -> None:
    # Pydantic validation should block invalid issue enums
    with pytest.raises(ValidationError) as excinfo:
        check_tenant_rights(cast(StateEnum, "CA"), cast(IssueEnum, "invalid_issue"))
    assert (
        "Input should be 'heating', 'mold', 'eviction', 'entry_notice' or 'deposit'"
        in str(excinfo.value)
    )


def test_check_tenant_rights_disclaimer_present() -> None:
    res = check_tenant_rights(StateEnum.CA, IssueEnum.heating)
    assert "This is legal information, not legal advice." in res
    assert "Consult a licensed attorney for your specific situation." in res


def test_check_tenant_rights_all_fields_returned() -> None:
    res = check_tenant_rights(StateEnum.NY, IssueEnum.mold)
    assert "State: NY" in res
    assert "Issue: mold" in res
    assert "Law Details:" in res
    assert "This is legal information, not legal advice." in res


# --- Tests for draft_letter ---


def test_draft_letter_pii_boundary_enforced() -> None:
    # Under PII rules, model-facing letters must use placeholders
    res = draft_letter(
        issue="broken heater",
        tone=ToneEnum.formal,
        renter_name="{RENTER}",
        landlord_name="{LANDLORD}",
        issue_description="Heater has been offline since Tuesday.",
    )
    # Ensure no raw PII leaks into the generated content
    assert "John" not in res
    assert "Smith" not in res
    assert "{RENTER}" in res
    assert "{LANDLORD}" in res
    assert "This is legal information, not legal advice." in res


def test_draft_letter_invalid_tone_fails() -> None:
    # Pydantic validation should block invalid tone values
    with pytest.raises(ValidationError) as excinfo:
        draft_letter("issue", cast(ToneEnum, "angry"), "renter", "landlord", "desc")
    assert "Input should be 'friendly', 'formal' or 'legal_notice'" in str(
        excinfo.value
    )


def test_draft_letter_all_tones_succeed() -> None:
    for tone in [ToneEnum.friendly, ToneEnum.formal, ToneEnum.legal_notice]:
        res = draft_letter("issue", tone, "renter", "landlord", "desc")
        assert len(res) > 0
        assert "This is legal information, not legal advice." in res


# --- Tests for log_incident ---


def test_log_incident_first_creates_record() -> None:
    assert "renter_1" not in INCIDENT_LOG
    res = log_incident("renter_1", "Leaky pipe in hallway")
    assert "renter_1" in INCIDENT_LOG
    assert len(INCIDENT_LOG["renter_1"]) == 1
    assert "Total incidents logged: 1" in res


def test_log_incident_append_entries() -> None:
    log_incident("renter_1", "First issue")
    res = log_incident("renter_1", "Second issue")
    assert len(INCIDENT_LOG["renter_1"]) == 2
    assert INCIDENT_LOG["renter_1"][0]["description"] == "First issue"
    assert INCIDENT_LOG["renter_1"][1]["description"] == "Second issue"
    assert "Total incidents logged: 2" in res


def test_log_incident_timestamp_format() -> None:
    log_incident("renter_1", "Incident details")
    timestamp = INCIDENT_LOG["renter_1"][0]["timestamp"]
    # Verify ISO-8601 parsing succeeds
    dt = datetime.datetime.fromisoformat(timestamp)
    assert isinstance(dt, datetime.datetime)


# --- Tests for process_checkout ---


def test_process_checkout_success() -> None:
    # cart_001 total is 150.0. Applying LEGALAID50 (50.0 discount) -> 100.0 final total.
    res = process_checkout(
        cart_id="cart_001", renter_id="renter_123", voucher_code="LEGALAID50"
    )
    assert res["success"] is True
    assert res["cart_id"] == "cart_001"
    assert res["discount_applied"] == "$50.00"
    assert res["order_total"] == 100.0
    assert res["confirmation_number"].startswith("CONF-cart_001-")
    assert res["error"] is None
    assert VOUCHER_STORE["LEGALAID50"]["redeemed"] is True
    assert VOUCHER_STORE["LEGALAID50"]["renter_id"] == "renter_123"


def test_process_checkout_already_redeemed_voucher_fails() -> None:
    process_checkout(
        cart_id="cart_001", renter_id="renter_123", voucher_code="LEGALAID50"
    )
    res = process_checkout(
        cart_id="cart_002", renter_id="renter_456", voucher_code="LEGALAID50"
    )
    assert res["success"] is False
    assert "already been redeemed" in str(res["error"])


def test_process_checkout_invalid_cart_owner_fails() -> None:
    # cart_001 belongs to renter_123, but renter_456 is attempting to check out
    res = process_checkout(
        cart_id="cart_001", renter_id="renter_456", voucher_code="LEGALAID50"
    )
    assert res["success"] is False
    assert "does not belong to renter" in str(res["error"])


def test_process_checkout_unregistered_renter_fails() -> None:
    res = process_checkout(
        cart_id="cart_001",
        renter_id="unregistered_123",
        voucher_code="LEGALAID50",
    )
    assert res["success"] is False
    assert "is not registered" in str(res["error"])


def test_process_checkout_missing_cart_fails() -> None:
    res = process_checkout(
        cart_id="cart_999", renter_id="renter_123", voucher_code="LEGALAID50"
    )
    assert res["success"] is False
    assert "does not exist" in str(res["error"])


def test_process_checkout_validation_error() -> None:
    res = process_checkout(
        cart_id="", renter_id="renter_123", voucher_code="LEGALAID50"
    )
    assert res["success"] is False
    assert "Validation Error" in str(res["error"])


def test_process_checkout_case_insensitive_voucher() -> None:
    res = process_checkout(
        cart_id="cart_001", renter_id="renter_123", voucher_code="legalaid50"
    )
    assert res["success"] is True
    assert res["discount_applied"] == "$50.00"
    assert res["order_total"] == 100.0
