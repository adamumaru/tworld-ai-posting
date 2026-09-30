# T-World AI-Assisted Smart Posting & Asset Retrieval System
## System Architecture & Technical Design Document

---

## 1. Executive Summary & Problem Scope

T-World provides creators, educators, and entrepreneurs with a publishing ecosystem integrated with a central media library (**Files & Docs**). 

Manual post composition and manual asset discovery create friction:
1. Users struggle to structure coherent, punchy posts tailored to different formats.
2. Users struggle to find relevant media assets buried in their file repositories.
3. Media assets must adhere to strict moderation workflows (AWS Step Functions/Rekognition). Unapproved, pending, or rejected assets must **never** be recommended or attached.

This system provides a production-grade backend service built with Node.js/Express, MongoDB, and an LLM orchestration layer that provides:
- **AI-Assisted Post Generation**: Structured drafting (short, long, bulleted, rephrased) with context injection and deterministic offline fallbacks.
- **Context-Aware Media Recommendation**: A hybrid keyword, tag-overlap, and semantic retrieval engine restricted exclusively to `approved` assets.
- **Traceability & Fault Isolation**: Full audit logging, timeout circuit breakers (5000ms), and error boundaries that guarantee zero downtime if upstream LLMs fail.

---

## 2. High-Level System Architecture

```
                       +---------------------------------------+
                       |       Client (React / Zustand)        |
                       +---------------------------------------+
                                           |
                                     RESTful JSON
                                           v
                       +---------------------------------------+
                       |         Node.js / Express API         |
                       | - Input Sanitization & Validation     |
                       | - Rate Limiting & Auth Guard          |
                       | - Error Boundaries & Request Context  |
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

---

## 3. Core Component Breakdown

### 3.1 API & Controller Layer (`src/controllers/`)
- **`fileController.js`**: Handles file queries, filtering by category and status, S3 upload intent creation, and moderation callbacks.
- **`aiController.js`**: Handles post generation requests, mode changes, and text rephrasing.
- **`recommendationController.js`**: Handles context-based asset recommendations and hashtag suggestions.

### 3.2 Service Layer (`src/services/`)
- **`aiService.js`**:
  - Implements provider-agnostic LLM interface (OpenAI API / Local mock).
  - Enforces 5000ms timeout per invocation.
  - Automatically routes to `fallbackGenerator` if upstream API fails or times out.
- **`recommendationService.js`**:
  - Queries database with strict condition: `{ status: "approved" }`.
  - Tokenizes input post content, removes common stop words, and computes weighted Jaccard/overlap scores against file `originalName`, `metadata.tags`, and `metadata.extractedKeywords`.
  - Attaches a human-readable match reason (`"Matched tags: [finance, education]"`).
  - Handles zero-match scenarios gracefully without breaking UI flow.
- **`fileService.js`**:
  - Manages asset metadata lifecycle.
  - Simulates S3 pre-signed upload URL generation (`upload_initiated`).
  - Simulates AWS Step Functions callback to transition files to `approved` or `rejected`.

### 3.3 Persistence Layer (`src/models/`)
- **`File` Schema**:
  - `filename`, `originalName`, `category` (`images` | `videos` | `audio` | `documents`), `mimeType`, `sizeBytes`, `s3Key`, `s3Bucket`.
  - `status` (`upload_initiated` | `scan_in_progress` | `approved` | `rejected`).
  - `metadata`: `{ tags: [String], description: String, extractedKeywords: [String] }`.
- **`AiAuditLog` Schema**:
  - `endpoint`, `userId`, `requestHash`, `tokensUsed`, `latencyMs`, `fallbackTriggered`, `statusCode`, `error`, `timestamp`.

---

## 4. API Specifications & Contracts

### 4.1 Post Generation
- **Endpoint**: `POST /api/ai/generate-post`
- **Request Body**:
```json
{
  "topic": "Launching Tongston Entrepreneurial Hub in Abuja",
  "mode": "short", // "short" | "long" | "bulleted" | "rephrase"
  "context": "Empowering youth with practical financial literacy and tech skills."
}
```
- **Response Body (200 OK)**:
```json
{
  "success": true,
  "data": {
    "content": "Big news for changemakers in Abuja! Today we officially unveil the Tongston Entrepreneurial Hub—a dedicated space designed to turn ambition into enterprise. From real-world financial literacy to hands-on tech incubation, we are building the next generation of value creators.\n\nJoin us on this journey. Details below! #TongstonHub #AbujaEntrepreneurs #YouthEmpowerment",
    "mode": "short",
    "wordCount": 54,
    "fallbackTriggered": false,
    "suggestedHashtags": ["#TongstonHub", "#AbujaEntrepreneurs", "#YouthEmpowerment"],
    "latencyMs": 418
  }
}
```

### 4.2 Smart Media Recommendation
- **Endpoint**: `POST /api/ai/recommend-media`
- **Request Body**:
```json
{
  "postContent": "Reviewing our annual financial report and curriculum strategy for 2025.",
  "categoryFilter": "all", // "all" | "documents" | "images" | "videos" | "audio"
  "limit": 5
}
```
- **Response Body (200 OK)**:
```json
{
  "success": true,
  "data": {
    "count": 2,
    "recommendations": [
      {
        "fileId": "651a1b2c3d4e5f6a7b8c9d01",
        "originalName": "Annual Report 2025.pdf",
        "category": "documents",
        "mimeType": "application/pdf",
        "s3Url": "https://tworld-assets-prod.s3.amazonaws.com/media/documents/annual-report-2025.pdf",
        "score": 0.88,
        "matchReason": "Strong match on tags: [finance, annual report, strategy]"
      },
      {
        "fileId": "651a1b2c3d4e5f6a7b8c9d02",
        "originalName": "Curriculum Framework Infographic.png",
        "category": "images",
        "mimeType": "image/png",
        "s3Url": "https://tworld-assets-prod.s3.amazonaws.com/media/images/curriculum-infographic.png",
        "score": 0.72,
        "matchReason": "Matched keywords: [curriculum, education]"
      }
    ]
  }
}
```

### 4.3 Files & Moderation Endpoints
- `GET /files?type=documents&status=approved` -> Returns list of approved document assets.
- `POST /files/upload-intent` -> Returns S3 upload metadata and creates record with `upload_initiated`.
- `POST /files/moderation-callback` -> Webhook payload from AWS Step Functions setting `approved` or `rejected`.

---

## 5. Defense in Depth: Content Safety & Moderation Boundaries

1. **Database Level**: All recommendation queries use a hardcoded query constraint:
   ```javascript
   const query = { status: 'approved' };
   if (category && category !== 'all') query.category = category;
   const candidates = await File.find(query).lean();
   ```
2. **Controller Level**: Any asset ID passed to a post attachment route undergoes an explicit status verification assertion before being linked.
3. **No Unmoderated Bypass**: Assets uploaded via `upload-intent` are quarantined in `upload_initiated` or `scan_in_progress` until an authentic signed callback changes the status to `approved`.

---

## 6. Fault Tolerance & Deterministic Fallbacks

When external LLM APIs fail (network partition, rate-limiting HTTP 429, API downtime HTTP 503, or latency > 5000ms):
1. **Circuit Breaker / Timeout**: `Promise.race` aborts the upstream request at 5000ms.
2. **Rule-Based Fallback Generator**: The service synthesizes a clean, grammatically sound post using topic extraction, pre-computed hook patterns, and template composition.
3. **Audit Logging**: The log record marks `fallbackTriggered: true` and logs the error code for observability.
4. **UX Transparency**: The frontend receives a `fallbackTriggered: true` flag, allowing it to display a subtle indicator (e.g. *"Generated using offline template assistant"*) without halting user workflow.
