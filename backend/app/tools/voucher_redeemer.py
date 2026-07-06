from pydantic import validate_call

from app.app_utils.tool_decorator import tool
from app.data.voucher_store import VOUCHER_STORE


@tool
@validate_call
def redeem_voucher(code: str, renter_id: str) -> str:
    """Validates and redeems a single-use legal aid voucher code for a verified renter.

    Args:
        code: The voucher code (must be 'LEGALAID50', 'FIRSTMONTHFREE', or 'WELCOME100').
        renter_id: The verified renter ID redeeming the voucher.

    Returns:
        A string indicating the redemption status.
    """
    voucher_code = code.strip().upper()
    r_id = renter_id.strip()

    if voucher_code not in VOUCHER_STORE:
        return f"Error: Invalid voucher code '{code}'."

    voucher = VOUCHER_STORE[voucher_code]

    if voucher["redeemed"]:
        return f"Error: Voucher '{voucher_code}' has already been redeemed by Renter '{voucher['renter_id']}'."

    # Redeem the voucher
    voucher["redeemed"] = True
    voucher["renter_id"] = r_id

    return f"Success: Voucher '{voucher_code}' has been successfully redeemed and locked to Renter '{r_id}'."
