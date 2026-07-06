import threading
import uuid
from typing import TypedDict

from pydantic import BaseModel, Field, ValidationError

from app.app_utils.tool_decorator import tool
from app.data.carts import CARTS
from app.data.registered_renters import REGISTERED_RENTERS
from app.tools.voucher_redeemer import redeem_voucher

checkout_lock = threading.Lock()


class CheckoutRequest(BaseModel):
    cart_id: str = Field(..., min_length=1)
    renter_id: str = Field(..., min_length=1)
    voucher_code: str = Field(..., min_length=1)


class CheckoutConfirmation(TypedDict):
    success: bool
    cart_id: str
    discount_applied: str
    order_total: float
    confirmation_number: str
    error: str | None


VOUCHER_DISCOUNTS = {
    "LEGALAID50": 50.0,
    "FIRSTMONTHFREE": 250.0,
    "WELCOME100": 100.0,
}


@tool
def process_checkout(
    cart_id: str, renter_id: str, voucher_code: str
) -> CheckoutConfirmation:
    """Processes checkout by validating inputs, applying a voucher, and generating confirmation.

    Args:
        cart_id: The ID of the cart to checkout.
        renter_id: The ID of the renter checking out.
        voucher_code: The legal aid voucher code to apply.

    Returns:
        A structured confirmation dictionary with execution results.
    """
    # 1. Pydantic validation for non-empty/non-null strings
    try:
        req = CheckoutRequest(
            cart_id=cart_id, renter_id=renter_id, voucher_code=voucher_code
        )
    except ValidationError as e:
        return {
            "success": False,
            "cart_id": cart_id or "",
            "discount_applied": "$0.00",
            "order_total": 0.0,
            "confirmation_number": "",
            "error": f"Validation Error: {e.errors()[0]['msg']}",
        }

    clean_cart_id = req.cart_id.strip()
    clean_renter_id = req.renter_id.strip()
    clean_voucher_code = req.voucher_code.strip().upper()

    # Thread-safe critical section lock to prevent concurrent double-redemptions
    with checkout_lock:
        # 2. Verify renter exists in registered renters
        if clean_renter_id not in REGISTERED_RENTERS:
            return {
                "success": False,
                "cart_id": clean_cart_id,
                "discount_applied": "$0.00",
                "order_total": 0.0,
                "confirmation_number": "",
                "error": f"Error: Renter '{clean_renter_id}' is not registered.",
            }

        # 3. Verify cart exists and belongs to the correct renter
        if clean_cart_id not in CARTS:
            return {
                "success": False,
                "cart_id": clean_cart_id,
                "discount_applied": "$0.00",
                "order_total": 0.0,
                "confirmation_number": "",
                "error": f"Error: Cart '{clean_cart_id}' does not exist.",
            }

        cart = CARTS[clean_cart_id]
        original_total = float(cart["order_total"])
        if cart["renter_id"] != clean_renter_id:
            return {
                "success": False,
                "cart_id": clean_cart_id,
                "discount_applied": "$0.00",
                "order_total": original_total,
                "confirmation_number": "",
                "error": f"Error: Cart '{clean_cart_id}' does not belong to renter '{clean_renter_id}'.",
            }

        # 4. Call redeem_voucher internally to apply the discount
        redeem_res = redeem_voucher(clean_voucher_code, clean_renter_id)
        if redeem_res.startswith("Error:"):
            return {
                "success": False,
                "cart_id": clean_cart_id,
                "discount_applied": "$0.00",
                "order_total": original_total,
                "confirmation_number": "",
                "error": redeem_res,
            }

        # 5. Apply discount from voucher
        discount = VOUCHER_DISCOUNTS.get(clean_voucher_code, 0.0)
        final_total = max(0.0, original_total - discount)
        conf_num = f"CONF-{clean_cart_id}-{uuid.uuid4().hex[:8].upper()}"

        return {
            "success": True,
            "cart_id": clean_cart_id,
            "discount_applied": f"${discount:.2f}",
            "order_total": final_total,
            "confirmation_number": conf_num,
            "error": None,
        }
