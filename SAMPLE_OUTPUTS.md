# T-World AI Assistant: Sample Outputs & Test Cases

This document records concrete prompt inputs, system responses, media recommendation rankings, and edge case handling across all core modes of the T-World system.

---

## 1. AI Post Generation Scenarios

### 1.1 Scenario A: Short / Punchy Social Post
- **Endpoint**: `POST /api/ai/generate-post`
- **Payload**:
  ```json
  {
    "topic": "Tongston Entrepreneurial Hub launch in Abuja",
    "mode": "short",
    "context": "Empowering youth with practical financial literacy and tech skills."
  }
  ```
- **System Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "Big news for changemakers in Abuja! Today we officially unveil the Tongston Entrepreneurial Hub—a dedicated space designed to turn ambition into enterprise. From real-world financial literacy to hands-on tech incubation, we are building the next generation of value creators.\n\nJoin us on this journey. Details below! #TongstonHub #AbujaEntrepreneurs #YouthEmpowerment",
      "mode": "short",
      "wordCount": 54,
      "fallbackTriggered": false,
      "suggestedHashtags": [
        "#TongstonHub",
        "#AbujaEntrepreneurs",
        "#YouthEmpowerment",
        "#ValueCreation"
      ],
      "latencyMs": 418
    }
  }
  ```

---

### 1.2 Scenario B: Long-Form / Thought Leadership Post
- **Endpoint**: `POST /api/ai/generate-post`
- **Payload**:
  ```json
  {
    "topic": "The Shift from Degrees to Value Creation in African Higher Education",
    "mode": "long",
    "context": "Tongston philosophy on entrepreneurial education, sustainable economic impact, and moving beyond theoretical certificates."
  }
  ```
- **System Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "For decades, the standard path to career security was simple: earn a degree, secure a certificate, and wait for opportunity. But across Africa’s fastest-growing economies, the landscape has fundamentally shifted.\n\nA degree certifies what you studied yesterday. Value creation proves what you can solve today.\n\nAt Tongston, we believe education is only complete when it empowers individuals to think entrepreneurially—generating tangible value, influence, and profitability in their communities. It’s no longer enough for universities to be research archives; they must become engines of enterprise.\n\nTo the educators, institutions, and learners rethinking the future: let’s move beyond passive credentialism and build active ecosystems of innovation.\n\nWhat is one skill your academic journey never taught you that proved essential in the real world?",
      "mode": "long",
      "wordCount": 138,
      "fallbackTriggered": false,
      "suggestedHashtags": [
        "#EntrepreneurialEducation",
        "#HigherEdInnovation",
        "#FutureOfWork",
        "#ValueCreation",
        "#Tongston"
      ],
      "latencyMs": 682
    }
  }
  ```

---

### 1.3 Scenario C: Bulleted / Action-Oriented Post
- **Endpoint**: `POST /api/ai/generate-post`
- **Payload**:
  ```json
  {
    "topic": "3 Core Habits for Early-Stage Startup Financial Health",
    "mode": "bulleted",
    "context": "Cash flow discipline, separating personal and business accounts, measuring unit economics weekly."
  }
  ```
- **System Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "Most early-stage ventures don't fail from lack of vision; they fail from cash flow blindspots. Here are 3 non-negotiable financial habits every founder must build:\n\n• Strict Account Separation: Never blend personal living expenses with company runway. Transparency begins with clean ledgers.\n• Weekly Unit Economic Reviews: Don't wait for month-end reports. Track your gross margin and customer acquisition cost weekly.\n• 6-Month Cash Buffer Discipline: Treat your operating reserves as insurance against macroeconomic volatility.\n\nDiscipline is the foundation of profitability. Which of these three is your team currently prioritizing?",
      "mode": "bulleted",
      "wordCount": 89,
      "fallbackTriggered": false,
      "suggestedHashtags": [
        "#StartupFinance",
        "#CashFlowDiscipline",
        "#Entrepreneurship",
        "#TongstonBusiness"
      ],
      "latencyMs": 489
    }
  }
  ```

---

### 1.4 Scenario D: Rephrase / Polish Draft
- **Endpoint**: `POST /api/ai/generate-post`
- **Payload**:
  ```json
  {
    "topic": "Rephrase",
    "mode": "rephrase",
    "context": "hey guys we did a workshop yesterday on pitching to investors and it was really nice many people came and they learned how to make slides and talk to vc."
  }
  ```
- **System Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "Yesterday’s Masterclass on Investor Pitching exceeded all expectations!\n\nWe hosted over 85 founders and entrepreneurs for an intensive session breaking down high-converting pitch deck frameworks and venture capital communication tactics.\n\nA huge thank you to everyone who joined us and brought sharp questions to the table. The next cohort opens next month—stay tuned!\n\n#InvestorPitch #VentureReadiness #FounderMasterclass #TongstonHub",
      "mode": "rephrase",
      "wordCount": 66,
      "fallbackTriggered": false,
      "suggestedHashtags": [
        "#InvestorPitch",
        "#VentureReadiness",
        "#FounderMasterclass",
        "#TongstonHub"
      ],
      "latencyMs": 512
    }
  }
  ```

---

## 2. Smart Media Recommendation Scenarios

### 2.1 Scenario A: High-Relevance Multi-Asset Match
- **Endpoint**: `POST /api/ai/recommend-media`
- **Payload**:
  ```json
  {
    "postContent": "Reviewing our annual financial report and curriculum strategy for 2025.",
    "categoryFilter": "all",
    "limit": 3
  }
  ```
- **System Output (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "querySummary": {
        "extractedTokens": ["annual", "financial", "report", "curriculum", "strategy", "2025"],
        "filteredCategory": "all",
        "totalApprovedPoolScanned": 12
      },
      "recommendations": [
        {
          "fileId": "651a1b2c3d4e5f6a7b8c9d01",
          "originalName": "Annual Report 2025.pdf",
          "category": "documents",
          "mimeType": "application/pdf",
          "sizeBytes": 2450123,
          "score": 0.94,
          "matchReason": "Exact keyword overlap on [annual, financial, report, 2025] and tags [finance, strategy]"
        },
        {
          "fileId": "651a1b2c3d4e5f6a7b8c9d04",
          "originalName": "Curriculum Framework Infographic.png",
          "category": "images",
          "mimeType": "image/png",
          "sizeBytes": 1184920,
          "score": 0.81,
          "matchReason": "Strong match on keyword [curriculum] and tags [education, curriculum]"
        }
      ]
    }
  }
  ```

---

### 2.2 Scenario B: Security Boundary Verification (Exclusion of Rejected/Pending Assets)
- **Database State**:
  - `File A` (`originalName`: `"2025-Financial-Scandal-Unverified.pdf"`): Tags `["financial", "report"]`, `status`: `"rejected"`.
  - `File B` (`originalName`: `"Q3-Draft-Review.docx"`): Tags `["financial", "strategy"]`, `status`: `"scan_in_progress"`.
  - `File C` (`originalName`: `"Approved-Financial-Summary.pdf"`): Tags `["financial", "report"]`, `status`: `"approved"`.
- **Query**: `"financial report"`
- **Result**:
  - `File A` and `File B` are **completely filtered out** at the database query layer (`{ status: "approved" }`).
  - Only `File C` appears in `data.recommendations`.
  - **Security Assertion**: 0% leakage of unmoderated assets.

---

## 3. Failure & Edge Case Handling Scenarios

### 3.1 Empty or Weak Input
- **Endpoint**: `POST /api/ai/generate-post`
- **Payload**:
  ```json
  {
    "topic": "   ",
    "mode": "short"
  }
  ```
- **System Output (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Topic or context must contain at least 5 meaningful characters.",
      "field": "topic"
    }
  }
  ```

---

### 3.2 Upstream LLM Timeout with Deterministic Fallback
- **Simulated Condition**: Upstream LLM API fails to respond within 5000ms.
- **System Behavior**: Circuit breaker fires at 5000ms and engages local deterministic template generator.
- **System Output (200 OK with Fallback Indicator)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "Excited to share insights on Launching Tongston Entrepreneurial Hub! Key focus areas include practical financial literacy and tech skills. Building sustainable value together.\n\n#TongstonHub #ValueCreation",
      "mode": "short",
      "wordCount": 31,
      "fallbackTriggered": true,
      "notice": "Generated using our offline rule-based assistant due to high upstream network latency.",
      "suggestedHashtags": ["#TongstonHub", "#ValueCreation"],
      "latencyMs": 5003
    }
  }
  ```
- **Audit Log Entry in MongoDB**:
  ```json
  {
    "endpoint": "/api/ai/generate-post",
    "fallbackTriggered": true,
    "statusCode": 200,
    "latencyMs": 5003,
    "error": "UPSTREAM_TIMEOUT_5000MS"
  }
  ```

---

### 3.3 No Relevant Media Match
- **Endpoint**: `POST /api/ai/recommend-media`
- **Payload**:
  ```json
  {
    "postContent": "Deep sea marine biology and coral reef preservation techniques.",
    "categoryFilter": "all"
  }
  ```
- **System Output (200 OK - Graceful Zero-Result)**:
  ```json
  {
    "success": true,
    "data": {
      "recommendations": [],
      "message": "No approved media matched your current post context. You can browse all approved assets via the Files & Docs library tab.",
      "reasonCode": "NO_MATCHING_APPROVED_MEDIA"
    }
  }
  ```
