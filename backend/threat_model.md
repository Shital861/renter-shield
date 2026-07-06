# STRIDE Threat Model Assessment — RenterShield Project

This threat modeling report provides a STRIDE evaluation of the `renter-shield` tenant rights assistant agent, analyzing the agent's graph, modular tools, data stores, and runtime verification hooks.

## 1. Executive Summary
RenterShield acts as an interactive assistant processing sensitive user data (PII) and legal claims. This threat model evaluates security risks across the STRIDE pillars to identify weaknesses in parameter validation, logging, and data privacy. The results show that while prompt PII leakage and malicious commands are heavily mitigated by automated pre-commit and runtime hooks, in-memory storage and lack of authentication present high identity spoofing and authorization risks.

---

## 2. System Boundary Map

```
               [ Renter / User ]
                       │
                       ▼
       [ Vertex AI Agent Engine / AdkApp ]
                       │
         (Loads Conversational History)
                       │
                       ▼
             [ renter_shield_agent ]
                       │
       (Evaluates Input & Executes Tools)
                       │
      ┌────────────────┼────────────────┬────────────────┐
      │                │                │                │
      ▼                ▼                ▼                ▼
[ rights_checker ] [ letter_drafter ] [ incident_logger ] [ voucher_redeemer ]
      │                │                │                │
      ▼                ▼                ▼                ▼
[ TENANT_RIGHTS ]   [ Hook: ]     [ INCIDENT_LOG ]  [ VOUCHER_STORE ]
                  (validate_pii)
```

### Entry Points
*   **User Chat Input**: Captures raw text from the tenant.
*   **Agent Tool Invocation**: Triggers execution of rights check, letter drafting, incident logging, and voucher redemption tools.

### Trust Boundaries & Data Stores
*   **Input Sanitization Boundary**: Formed by custom Semgrep rules and git pre-commit hooks.
*   **Tool Execution Boundary**: Intercepted by `PreToolUse` hooks (`validate_tool_call.py` and `validate_pii_boundary.py`).
*   **Data Stores**: Global volatile dictionaries (`TENANT_RIGHTS`, `VOUCHER_STORE`, and `INCIDENT_LOG`) containing mock laws, vouchers, and logged events.

---

## 3. STRIDE Findings Table

| STRIDE Pillar | Identified Threat / Risk | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Spoofing** | An attacker passes a victim's `renter_id` to spoof their identity during voucher redemption or incident logging. | **HIGH** | Retrieve the caller's validated `user_id` from the session context rather than accepting raw string inputs. |
| **Tampering** | Concurrent requests cause race conditions, or application restarts wipe the volatile global store dictionary states. | **MEDIUM** | Move data storage to a transactional persistent database with strict locking mechanics. |
| **Repudiation** | A tenant denies initiating a voucher redemption or log entry because in-memory values can be modified/deleted. | **MEDIUM** | Stream audit logs directly to a secure write-once log stream (e.g., Google Cloud Logging). |
| **Information Disclosure** | Renter or landlord names leak verbatim in prompts sent to the Gemini API. | **LOW** (Mitigated) | Blocked by `validate_pii_boundary.py` hook. Anonymize all outgoing prompt inputs with placeholders. |
| **Denial of Service** | Unbounded incident logging grows memory consumption (OOM), or request flooding exhausts Gemini API quotas. | **MEDIUM** | Implement request rate-limiting per client session and set size limits on the incident log lists. |
| **Elevation of Privilege** | An unauthenticated user accesses logs or redeems vouchers belonging to other tenants. | **HIGH** | Implement session verification and restrict tool access to authorized roles matching the target resource owner. |

---

## 4. Top 3 Priority Fixes for Hackathon Scope

1.  **Hardcoded API Key Remediation**: Extract the mock key from `app/agent.py` and retrieve it securely using `os.environ.get("GEMINI_API_KEY")` to clear git pre-commit blocks.
2.  **PII Sanitization Implementation**: Configure the letter drafter and agent prompts to work exclusively with `{RENTER}` and `{LANDLORD}` placeholders, substituting the actual names only at the final rendering stage.
3.  **Voucher Single-Use Lock**: Implement transactional checks during voucher redemption to prevent concurrent double-redemptions.

---

## 5. Accepted Risks (Out of Hackathon Scope)

*   **In-Memory Storage Volatility**: The volatile, non-persistent state of `VOUCHER_STORE` and `INCIDENT_LOG` is accepted for the prototype phase.
    *   *Rationale*: Transitioning to a persistent database (PostgreSQL/SQL) adds significant deployment complexity that is unnecessary for showcasing tool execution logic during the hackathon.
*   **Role-Based Access Control (RBAC)**: Validating the user's authentic identity against their requested `renter_id` is deferred.
    *   *Rationale*: Incorporating a complete Identity Provider (e.g., OAuth/OIDC) is beyond the scope of a local sandbox CLI playground testing environment.
