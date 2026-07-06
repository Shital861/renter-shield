# 🛡️ RenterShield
### AI Tenant Rights Concierge Agent

> *"Know your rights. Draft your letter. Build your paper trail."*

[![ADK 2.0](https://img.shields.io/badge/Google%20ADK-2.0-blue?style=flat-square)](https://google.github.io/adk-docs/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-brightgreen?style=flat-square)](https://deepmind.google/technologies/gemini/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-orange?style=flat-square)](LICENSE)
[![Kaggle Capstone](https://img.shields.io/badge/Kaggle-VibeCoding%20Capstone%202026-20BEFF?style=flat-square)](https://www.kaggle.com/competitions/vibecoding-agents-capstone-project)

---

## 🏠 The Problem

Millions of renters face illegal landlord behaviour every year —
unresolved repairs, wrongful evictions, unlawful entry, withheld
deposits — and have no idea what their legal rights are or what
to do next. A single correctly-worded demand letter resolves most
disputes. But writing that letter requires legal knowledge most
renters simply don't have.

**RenterShield closes that gap.**

---

## 💡 What It Does

RenterShield is a personal AI legal concierge that gives every
renter the same tenant protection knowledge that used to require
a $300/hr lawyer — in under 60 seconds, for free, with personal
data never leaving the user's device.

In one conversation, a renter can:

| Step | Action | Agent Tool |
|------|--------|------------|
| 1 | Understand their legal rights by state & issue | `check_tenant_rights` |
| 2 | Get a professionally drafted demand letter | `draft_letter` |
| 3 | Build a timestamped incident paper trail | `log_incident` |
| 4 | Redeem a single-use legal aid voucher | `redeem_voucher` |
| 5 | Process a checkout with discount applied | `process_checkout` |

---

## 🎬 Demo

```
Renter: "My landlord hasn't fixed my heating for 3 weeks. I'm in California."

Agent → check_tenant_rights("CA", "heating")
      → California Civil Code §1941. Landlord must maintain habitable
        conditions. 30-day cure period applies.
        "This is legal information, not legal advice."

Renter: "Draft a formal letter to my landlord."

Agent → draft_letter(issue="heating", tone="formal", ...)
      → [Full formal demand letter, copy-paste ready]

Renter: "Log this incident for renter-001"

Agent → log_incident("renter-001", "Formal letter sent re: heating")
      → Entry #1 logged. Timestamp: 2026-07-06T14:32:00Z

Renter: "I have a voucher code LEGALAID50"

Agent → redeem_voucher("LEGALAID50", "renter-001")
      → ✅ 50% discount applied. Code locked to renter-001.
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │  ← Vercel
│   Onboarding → Dashboard → Log      │
└──────────────┬──────────────────────┘
               │ POST /chat
               │ { message, renter_id, session_id }
┌──────────────▼──────────────────────┐
│         FastAPI Bridge              │  ← Google Cloud Run
│         app/api.py                  │
└──────────────┬──────────────────────┘
               │ ADK Runner
┌──────────────▼──────────────────────┐
│      Google ADK 2.0 Agent           │
│   LlmAgent (Gemini 2.5 Flash)       │
│                                     │
│  Tools:                             │
│  ├── check_tenant_rights            │
│  ├── draft_letter                   │
│  ├── log_incident                   │
│  ├── redeem_voucher                 │
│  └── process_checkout               │
│                                     │
│  Data:                              │
│  ├── TENANT_RIGHTS (5 states)       │
│  ├── VOUCHER_STORE (single-use)     │
│  ├── INCIDENT_LOG (per renter)      │
│  └── session.db (multi-turn)        │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
renter-shield/
│
├── app/                          # Agent layer (Person 2)
│   ├── agent.py                  # LlmAgent + retry logic
│   ├── api.py                    # FastAPI bridge
│   ├── tools/                    # 5 agent tools
│   │   ├── rights_checker.py
│   │   ├── letter_drafter.py
│   │   ├── incident_logger.py
│   │   ├── voucher_redeemer.py
│   │   └── checkout.py
│   ├── data/                     # In-memory data stores
│   │   ├── tenant_rights.py
│   │   ├── voucher_store.py
│   │   ├── registered_users.py
│   │   └── carts.py
│   └── app_utils/                # Shared utilities
│
├── frontend/                     # Frontend layer (Person 1)
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components
│   └── lib/                      # API + storage helpers
│
├── tests/
│   └── test_agent.py             # Security test suite
│
├── .agents/                      # Antigravity config
│   ├── CONTEXT.md                # Secure coding standards
│   ├── hooks.json                # PreToolUse intercepts
│   └── skills/stride-threat-model/
│
├── .semgrep/
│   └── rules.yaml                # Custom security rules
│
├── docs/
│   ├── AGENT_API_CONTRACT.md     # Frontend↔backend contract
│   ├── threat_model.md           # STRIDE v1
│   └── threat_model_v2.md        # STRIDE v2
│
├── .pre-commit-config.yaml       # Automated security pipeline
├── .env.example                  # Environment template
├── pyproject.toml                # Python dependencies
└── agents-cli-manifest.yaml      # ADK deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) package manager
- [agents-cli](https://pypi.org/project/google-agents-cli/) 0.5.0+
- Google AI Studio API key ([get one free](https://aistudio.google.com))

### Agent Setup (Person 2)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/renter-shield.git
cd renter-shield

# Create and activate virtual environment
uv venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

# Install dependencies
uv pip install -e .

# Set up environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Install pre-commit hooks
pre-commit install

# Run the agent locally
agents-cli playground
# OR
adk web .\app
```

### Frontend Setup (Person 1)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### API Bridge (Local)

```bash
# From project root
uvicorn app.api:app --reload --port 8000

# Test the API
curl http://localhost:8000/health
# → {"status": "ok", "agent": "renter_shield"}

# View interactive API docs
open http://localhost:8000/docs
```

---

## 🔒 Security Architecture

Security is a first-class feature of RenterShield — not an afterthought.

### 4-Layer Security Model

```
Layer 1 — Coding Standards    .agents/CONTEXT.md
           Pydantic validation, PII anonymization,
           no shell execution, legal disclaimer enforcement

Layer 2 — Static Analysis     .semgrep/rules.yaml
           Hardcoded key detection, PII in API calls,
           shell execution in tool files

Layer 3 — Pre-Commit Gates    .pre-commit-config.yaml
           Runs on every git commit — blocks on any finding

Layer 4 — Runtime Intercepts  .agents/hooks.json
           PreToolUse hooks validate shell commands
           and PII boundaries before execution
```

### Privacy Model

| Data | Where it lives |
|------|---------------|
| Renter name, address, landlord name | localStorage only — never sent to API |
| Issue type, state, escalation level | Sent to Gemini (anonymized) |
| Renter ID, voucher codes | Never sent to any external service |
| Incident log | localStorage only |
| Legal disclaimer | Injected on every agent response |

---

## 🧪 Running Tests

```bash
# Run the full security test suite
uv run pytest tests/test_agent.py -v

# Run pre-commit checks
pre-commit run --all-files

# Check for hardcoded secrets
grep -r "AIzaSy" app/
```

All tests should pass with 0 failures, 0 errors.

---

## 🌐 Deployment

### Agent API → Google Cloud Run

```bash
agents-cli deploy
```

### Frontend → Vercel

```bash
cd frontend
npx vercel deploy
```

Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
to your Cloud Run URL.

---

## 🔌 API Contract

The agent exposes a simple REST API for the frontend:

```
POST /chat
Body:    { "message": string, "renter_id": string, "session_id": string|null }
Returns: { "reply": string, "session_id": string }

GET /health
Returns: { "status": "ok", "agent": "renter_shield" }
```

**Valid inputs:**
- States: `CA` `NY` `TX` `FL` `WA`
- Issue types: `heating` `mold` `eviction` `entry_notice` `deposit`
- Letter tones: `friendly` `formal` `legal_notice`

Full contract: [`docs/AGENT_API_CONTRACT.md`](docs/AGENT_API_CONTRACT.md)

---

## 🛠️ Tech Stack

### Agent Layer
| | Technology |
|-|-----------|
| Agent framework | Google ADK 2.0 |
| LLM | Gemini 2.5 Flash |
| Language | Python 3.11 |
| Package manager | uv |
| Input validation | Pydantic v2 |
| Retry logic | tenacity (8 attempts, exponential backoff) |
| Secret detection | Semgrep 1.168.0 |
| API framework | FastAPI + uvicorn |
| Vibe coding | Antigravity (agents-cli 0.5.0) |
| Deployment | Google Cloud Run |

### Frontend Layer
| | Technology |
|-|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Deployment | Vercel |

---

## 👥 Team

| Role | Responsibility |
|------|---------------|
| **Person 2** | Agent layer, security pipeline, API bridge, deployment |
| **Person 1** | Frontend (Next.js), UI/UX, Vercel deployment |

---

## ⚠️ Legal Disclaimer

RenterShield provides legal information, not legal advice.
The information provided is for general informational purposes only
and should not be relied upon as legal advice for any specific situation.
Always consult a licensed attorney for advice specific to your circumstances.

---

## 📄 License

This project is licensed under the Apache License 2.0.
See [LICENSE](LICENSE) for details.

---
