---
name: STRIDE Threat Model Assessment
description: Analyzes the RenterShield agent codebase and customization rules against the STRIDE threat modeling framework to output a threat_model.md report.
---

# STRIDE Threat Model Assessment for Tenant Rights Agent

This skill guides the agent to evaluate the system architecture and implementation against the STRIDE pillars (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege), specifically focusing on:
- Verification of `renter_id` for vouchers and incident logging.
- In-memory data store tamper resistance.
- Immutable timestamp logging for audit trails and non-repudiation.
- PII sanitization boundaries (renter and landlord names).
- Rates/limits on resources and Gemini call retry logic.
- Isolation of session states and user validation.

The output report must be saved to the project root as `threat_model.md`.
