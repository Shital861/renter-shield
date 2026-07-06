# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import os
from functools import cached_property
from typing import Any, AsyncGenerator
from typing_extensions import override

import google.auth
from dotenv import load_dotenv
from google.auth.exceptions import DefaultCredentialsError
from google.adk.agents import Agent
from google.adk.apps import App
from google.adk.models import Gemini, LlmResponse, LlmRequest
from google.genai import types, Client
from google.genai.errors import APIError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

# Import tools
from app.tools.rights_checker import check_tenant_rights
from app.tools.letter_drafter import draft_letter
from app.tools.incident_logger import log_incident
from app.tools.voucher_redeemer import redeem_voucher
from app.tools.checkout import process_checkout

# Log configuration
logger = logging.getLogger("renter_shield")
logging.basicConfig(level=logging.INFO)

# Set environment defaults, avoiding crash if ADC is not set up
try:
    _, project_id = google.auth.default()
    os.environ["GOOGLE_CLOUD_PROJECT"] = project_id or ""
except DefaultCredentialsError:
    os.environ["GOOGLE_CLOUD_PROJECT"] = "mock-project-id"

os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    raise EnvironmentError(
        "GEMINI_API_KEY not set. Copy .env.example to .env and add your key."
    )


# --- Retry logic helpers ---


def is_retryable_exception(exception: Exception) -> bool:
    """Returns True if the exception is a 503 or 429 APIError, or mentions those codes."""
    if isinstance(exception, APIError):
        logger.info(f"Checking APIError code: {exception.code}")
        return exception.code in (429, 503)
    exc_str = str(exception)
    if "429" in exc_str or "503" in exc_str or "ResourceExhausted" in exc_str:
        logger.info(f"Exception matches retryable pattern: {exc_str}")
        return True
    return False


def log_retry(retry_state):
    print(
        f"[RETRY] Attempt #{retry_state.attempt_number} for Gemini API call... Reason: {retry_state.outcome.exception()}",
        flush=True,
    )


# --- Custom Gemini Model Class ---


class CustomGemini(Gemini):
    @cached_property
    @override
    def api_client(self) -> Client:
        from google.genai import Client

        return Client(api_key=api_key)

    @cached_property
    @override
    def _live_api_client(self) -> Client:
        from google.genai import Client

        return Client(api_key=api_key)

    @override
    async def generate_content_async(
        self, llm_request: LlmRequest, stream: bool = False
    ) -> AsyncGenerator[LlmResponse, None]:
        # Decorate the invocation call to collect all tokens under retry
        @retry(
            stop=stop_after_attempt(8),
            wait=wait_exponential(multiplier=2, min=4, max=15),
            retry=retry_if_exception(is_retryable_exception),
            before_sleep=log_retry,
            reraise=True,
        )
        async def _call_under_retry():
            results = []
            async for response in super(CustomGemini, self).generate_content_async(
                llm_request, stream
            ):
                results.append(response)
            return results

        responses = await _call_under_retry()
        for r in responses:
            yield r


# --- Root Agent and App ---

root_agent = Agent(
    name="renter_shield_agent",
    model=CustomGemini(
        model="gemini-2.5-flash",
    ),
    instruction=(
        "You are RenterShield, an AI tenant rights assistant. Help renters facing landlord disputes. "
        "You must ALWAYS use the check_tenant_rights tool to look up tenant rights. "
        "Every response containing legal rights or drafted letters must include the legal disclaimer: "
        "'This is legal information, not legal advice. Consult a licensed attorney for your specific situation.'"
    ),
    tools=[
        check_tenant_rights,
        draft_letter,
        log_incident,
        redeem_voucher,
        process_checkout,
    ],
)

app = App(
    root_agent=root_agent,
    name="app",
)
