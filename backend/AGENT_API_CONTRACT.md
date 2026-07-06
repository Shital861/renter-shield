# RenterShield Agent API Contract

This document outlines the API contract for the `renter-shield` tenant rights assistant agent, detailing input validation enums, Pydantic schemas, and structured outputs for all exposed tools.

---

## 1. Input Validation Enums

### StateEnum
Exposed US states for legal lookup:
*   `CA`, `NY`, `TX`, `FL`, `WA`

### IssueEnum
Exposed issue categories for rights lookups:
*   `heating`, `mold`, `eviction`, `entry_notice`, `deposit`

### ToneEnum
Exposed letter drafting tones:
*   `friendly`, `formal`, `legal_notice`

---

## 2. Tool Signatures

### `check_tenant_rights`
Looks up applicable tenant protection laws.
*   **Parameters**:
    *   `state`: `StateEnum` (validated)
    *   `issue`: `IssueEnum` (validated)
*   **Returns**: `str` containing State, Issue, Law Details, and the mandatory legal disclaimer.

### `draft_letter`
Generates a demand letter to a landlord.
*   **Parameters**:
    *   `issue`: `str`
    *   `tone`: `ToneEnum` (validated)
    *   `renter_name`: `str` (anonymized payload placeholder `{RENTER}`)
    *   `landlord_name`: `str` (anonymized payload placeholder `{LANDLORD}`)
    *   `issue_description`: `str`
*   **Returns**: `str` containing the drafted letter body and legal disclaimer.

### `log_incident`
Appends a timestamped entry to the renter's incident log.
*   **Parameters**:
    *   `renter_id`: `str` (non-empty)
    *   `description`: `str` (non-empty)
*   **Returns**: `str` confirmation message stating log success, ISO-8601 timestamp, and total incident count.

### `redeem_voucher`
Redeems a single-use legal aid voucher.
*   **Parameters**:
    *   `code`: `str` (case-insensitive, matches `LEGALAID50`, `FIRSTMONTHFREE`, `WELCOME100`)
    *   `renter_id`: `str` (non-empty)
*   **Returns**: `str` status outcome (success or error).

### `process_checkout`
Processes order checkouts by validating carts, registered renters, and applying vouchers.
*   **Parameters**:
    *   `cart_id`: `str` (non-empty)
    *   `renter_id`: `str` (non-empty)
    *   `voucher_code`: `str` (non-empty)
*   **Returns**: `CheckoutConfirmation` dictionary:
    ```json
    {
      "success": bool,
      "cart_id": string,
      "discount_applied": string,
      "order_total": float,
      "confirmation_number": string,
      "error": string or null
    }
    ```
