# T-World: AI-Assisted Smart Posting & Asset Retrieval System

A production-minded backend and interactive media-assisted post creation engine designed for Tongston’s **T-World** platform. Integrates the **Files & Docs** module, AWS moderation workflows, context-aware media retrieval, and fault-tolerant AI post drafting.

Repository: **[github.com/adamumaru/tworld-ai-posting](https://github.com/adamumaru/tworld-ai-posting)** (Public)

---

## 1. Quick Start

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- *(Optional)* MongoDB instance on port 27017. If no MongoDB is running, an in-memory database automatically initializes with zero configuration.

### Installation
```bash
# Clone the repository
git clone https://github.com/adamumaru/tworld-ai-posting.git
cd tworld-ai-posting

# Install dependencies
npm install

# Seed the database with realistic assets across all 4 moderation states
npm run seed
```

### Run Tests
```bash
npm test
```
*Verifies all 16 critical assertions: unapproved file exclusion, fallback circuit breaker, structured format modes, and audit telemetry.*

### Start Server & Interactive Demo UI
```bash
npm start
```
Open **`http://localhost:4000`** in your browser to test the interactive React + Zustand post composer and asset picker modal.

---

## 2. Architecture & Design Principles

```
                       +---------------------------------------+
                       |       Client (React / Zustand)        |
                       +---------------------------------------+
                                           |
                                     RESTful JSON
                                           v
                       +---------------------------------------+
                       |         Node.js / Express API         |
                       |   - Route Handlers & Input Guards     |
                       |   - Audit Logging & Rate Limiting     |
                       +---------------------------------------+
                                /                     \
                               v                       v
       +------------------------------+   +------------------------------+
       |   AI Orchestration Service   |   |  Retrieval & Scoring Engine  |
       | - Prompt Template Engine     |   | - Strict Status Filter       |
       | - Token & Latency Controls   |   |   (status === 'approved')    |
       | - Deterministic Fallbacks    |   | - Token Overlap & Weighting  |
       | - Output Parser & Validator  |   | - Explainability Generator   |
       +------------------------------+   +------------------------------+
                                \                       /
                                 v                     v
                       +---------------------------------------+
                       |      Data Layer (MongoDB Mongoose)    |
                       | - files (metadata, S3 keys, status)   |
                       | - posts & drafts                      |
                       | - ai_audit_logs (telemetry & tokens)  |
                       +---------------------------------------+
                                          ^
                                          | (Webhook / Event Callback)
                       +---------------------------------------+
                       |  Simulated AWS Moderation Pipeline    |
                       |  (S3 Pre-signed Upload + Step Funcs)  |
                       +---------------------------------------+
```

### Core Tenets
1. **Defensive by Default**: Non-approved or rejected files are barred from retrieval at the database query level (`{ status: "approved" }`). Unapproved assets never leak.
2. **Circuit-Breaker Fallback**: External LLM calls have a strict 5000ms timeout. If upstream APIs fail or hang, a deterministic rule-based generator provides structured output (`short`, `long`, `bulleted`, `rephrase`), ensuring 0% user downtime.
3. **Traceability**: Every AI generation and recommendation request logs payload hashes, tokens, latency, status codes, and fallback flags in MongoDB (`ai_audit_logs`).

---

## 3. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/generate-post` | Structured post generation (`short`, `long`, `bulleted`, `rephrase`) |
| `POST` | `/api/ai/recommend-media` | Context-aware media ranking strictly from approved files |
| `POST` | `/api/ai/suggest-hashtags` | Derives ranked hashtags from post text |
| `POST` | `/api/ai/suggest-improvements` | Readability, hook strength, and CTA analysis |
| `GET`  | `/api/files/asset-picker` | Unified payload: contextual AI suggestions + categorized assets |
| `GET`  | `/files` | Files & Docs module asset listing with category & status filters |
| `POST` | `/files/upload-intent` | Simulates S3 pre-signed upload URL & initial `upload_initiated` state |
| `POST` | `/files/moderation-callback` | Simulates AWS Step Functions webhook updating status to `approved` or `rejected` |

---

## 4. Documentation Directory

- [**`SYSTEM_DESIGN.md`**](./SYSTEM_DESIGN.md): Technical architecture, data flow diagrams, and security boundaries.
- [**`SAMPLE_OUTPUTS.md`**](./SAMPLE_OUTPUTS.md): Verified prompts, mode variations, media recommendations, and edge cases.
- [**`PRODUCTION_READINESS.md`**](./PRODUCTION_READINESS.md): Direct responses to the 5 mandatory evaluation reflection questions.
- [**`AGENTS.md`**](./AGENTS.md): Multi-agent execution blueprints and task divisions.
- [**`SUBMISSION_CHECKLIST.md`**](./SUBMISSION_CHECKLIST.md): Assessment criteria verification checklist.
