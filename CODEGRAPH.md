# HE SUITE — Codegraph
> Generated: 2026-10-27T13:30:00+07:00 | Source: live codebase scan

---

## 1. System Architecture (v2.0 — branch `mini`)

```mermaid
graph TD
    subgraph BROWSER_EXT["Chrome Extension Bridge (extension/)"]
        EXT_BG["background.js\n(tabs & cookies API)"]
        EXT_CS["content.js\n(DOM bridge & postMessage)"]
    end

    subgraph CLIENT["Frontend Client (React SPA — NES.css)"]
        SIDEBAR["Sidebar.jsx\n(3 Menus, Status AI Agent)"]
        HE_CHAT["HEChat.jsx\n(Prompt, Tab Session Bridge, SSE Stream, Table, Excel Export)"]
        BRAIN_PAGE["SecondBrain.jsx\n(UX Rules, Tags, Toggle Active, Vault Docs)"]
        CFG_PAGE["ModelConfig.jsx\n(API Key, Presets: DeepSeek/Gemini/OpenAI, Live Test)"]
    end

    subgraph SERVER["Backend API (Express :8888)"]
        ROUTER_HE["api/routes/he.js\nPOST /run (with cookies), GET /reports, GET /export/excel"]
        ROUTER_BRAIN["api/routes/brain.js\nCRUD /notes, /vault, /stats"]
        ROUTER_CFG["api/routes/config.js\nGET /config, POST /config, POST /test"]
    end

    subgraph SERVICES["Domain Services"]
        SVC_AI["api/services/ai.js\nOpenAI SDK, Domain Fallback, Stream Chunks"]
        SVC_CRAWL["api/services/crawler.js\nStealth Puppeteer + Cookie Injector"]
        SVC_BRAIN["api/services/brain.js\nSecond Brain Storage & Active Context Aggregator"]
        SVC_KB["api/services/kb-parser.js\nOfficeParser (PPT/PPTX/PDF/DOCX/TXT/MD)"]
        SVC_CFG["api/services/config.js\n.env Safe Reader/Writer"]
    end

    subgraph STORAGE["Persistent Storage"]
        ENV[".env (Keys & Config)"]
        BRAIN_DB["public/data/second_brain.json"]
        KB_DIR["public/knowledge_base/ (Vault)"]
        REPORTS["public/data/reports.json"]
        STATIC["dist/ (Built Assets)"]
    end

    BROWSER_EXT <-->|window.postMessage| HE_CHAT
    CLIENT -->|REST / SSE| SERVER
    ROUTER_HE --> SVC_AI
    ROUTER_HE --> SVC_CRAWL
    ROUTER_HE --> SVC_BRAIN
    ROUTER_HE --> REPORTS

    ROUTER_BRAIN --> SVC_BRAIN
    SVC_BRAIN --> BRAIN_DB
    SVC_BRAIN --> KB_DIR

    ROUTER_CFG --> SVC_CFG
    ROUTER_CFG --> SVC_AI
    SVC_CFG --> ENV
```

---

## 2. Component Dependency & Touchpoints

```mermaid
graph TD
    APP["App.jsx\nActive Tab State & Status Polling"]
    APP --> SIDEBAR["Sidebar.jsx\n- 3 Main Navigation Buttons\n- Status AI Agent Heart Icon"]
    APP --> HEC["pages/HEChat.jsx\n- Prompt input with auto case extraction\n- Real-time crawler & AI stream log\n- Horizontal scrollable findings table (min-width: 1300px)\n- Separate 'Detail Masalah' vs 'Rekomendasi Perbaikan' columns\n- Excel (.xlsx) & JSON download buttons"]
    APP --> KBC["pages/KnowledgeBase.jsx\n- Drag-and-drop file uploader\n- File cards (PPT, PPTX, PDF, DOCX, TXT, MD)\n- In-app text preview modal"]
    APP --> MCC["pages/ModelConfig.jsx\n- Masked API key input\n- Provider presets: OpenAI, Groq, Ollama\n- Live test connection button"]
```

---

## 3. Data Flow: Heuristic Evaluation Run

```mermaid
sequenceDiagram
    autonumber
    actor User as UX / QA Evaluator
    participant UI as HEChat (FE)
    participant API as api/routes/he.js
    participant Crawl as Crawler (Puppeteer)
    participant KB as KB Parser
    participant AI as AI Engine (OpenAI API)
    participant Store as reports.json

    User->>UI: Submit prompt (e.g. "lakukan he untuk xxx.com dengan case: login, register")
    UI->>API: POST /api/he/run (SSE stream)
    API-->>UI: event: step "Parsing prompt & extracting cases..."
    API->>Crawl: runCrawler(url, cases)
    Crawl-->>API: DOM elements, console errors, screenshot
    API-->>UI: event: step "Crawler completed! Analyzing findings with KB..."
    API->>KB: getAllKnowledgeBaseText()
    KB-->>API: Aggregated Heuristic / WCAG context
    API->>AI: evaluateStream(targetUrl, cases, crawlData, kbContext)
    AI-->>API: Stream chunks (text delta)
    API-->>UI: event: chunk (live AI narrative)
    AI-->>API: Stream completion + JSON block
    API->>Store: Persist new report with structured findings
    API-->>UI: event: complete (report JSON)
    UI->>UI: Render structured findings table & enable Excel export
```

---

## 4. Technology Stack & Packages

| Component | Technology / Library | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Single Page Application shell |
| **8-Bit Theme** | `nes.css` | Authentic Nintendo/Arcade components, buttons, containers |
| **Typography** | `Press Start 2P` + `Inter` | 8-bit titles/badges + crystal clear readability for table text |
| **Icons** | `nes-icon` + `lucide-react` | Retro icons & UI utilities |
| **Backend Framework** | Node.js + Express | REST API, SSE Streaming, Static file serving |
| **AI Client** | `openai` SDK | Universal OpenAI-compatible API connector (OpenAI, Groq, Ollama, etc.) |
| **Document Parser** | `officeparser` | Text extraction from PPT, PPTX, PDF, DOCX, TXT, MD |
| **Automation** | Puppeteer | Headless crawling, interactive elements & error capture |
| **Report Export** | `xlsx` | Native Excel (.xlsx) workbook generator |
| **Configuration** | `dotenv` | Safe `.env` file management for API keys |
