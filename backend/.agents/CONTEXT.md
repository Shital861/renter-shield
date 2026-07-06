# RenterShield — Local Project Context & Secure Coding Standards

## Core Paved Roads

1. **Tool Input Validation**: Every agent tool must validate
   incoming parameters against strict Pydantic schemas rather
   than parsing raw dictionaries or strings.

   Valid enums:
   - states: CA, NY, TX, FL, WA
   - issue types: heating, mold, eviction, entry_notice, deposit
   - letter tones: friendly, formal, legal_notice

2. **PII Anonymization**: renter_name and landlord_name must
   NEVER be sent raw to the Gemini API. Replace with {RENTER}
   and {LANDLORD} placeholders in all prompts and substitute
   real values only after the model responds.

3. **No Shell Execution**: Never use run_command or raw shell
   execution unless explicitly approved in hooks.json.

4. **Pre-Commit Remediation Loop**: If a git commit fails due
   to a pre-commit hook error, treat it as a refactoring task.
   Apply targeted fixes, run pytest, then re-run pre-commit
   before committing again. Never use --no-verify to bypass.

5. **Retry on API Failures**: All Gemini API calls must use
   tenacity with exponential backoff (3 retries, 2s base delay)
   to handle 503/429 errors gracefully.

6. **Legal Disclaimer**: Every tool returning legal content
   must append:
   "This is legal information, not legal advice.
    Consult a licensed attorney for your specific situation."

## TDD Planning Gate

During the Plan phase, decompose every task into logical,
modular stages. Every implementation plan MUST include a
dedicated **Security Boundaries & Assertions** section
covering:
- Invalid input edge cases
- Single-use enforcement bypass attempts
- PII leakage scenarios
- Unauthenticated access to privileged tools
