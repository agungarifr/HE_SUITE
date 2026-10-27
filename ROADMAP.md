# HE SUITE — Roadmap
> Last updated: 2026-10-27T13:30:00+07:00

---

## Status Legend
| Symbol | Meaning |
|--------|---------|
| 🔴 | Not started |
| 🟡 | In progress |
| 🟢 | Done |
| ⏸️ | Blocked |
| ❌ | Cancelled / Removed |

---

## Phase 0 — Foundation & Planning
> Status: 🟢 Completed (2026-10-27)

| Task | Role | Status | Notes |
|------|------|--------|-------|
| Analisis codebase v1 legacy | BE | 🟢 | Selesai |
| Buat branch `mini` | BE | 🟢 | Done |
| Install Ponytail + Caveman plugins | — | 🟢 | Active |
| Dokumen PROJECT.md, CHANGELOG.md, ROADMAP.md, CODEGRAPH.md | Team | 🟢 | Synced di root & artifact |
| UX wireframes & component map | UX | 🟢 | 3 main pages |

---

## Phase 1 — Teardown (Remove Legacy)
> Status: 🟢 Completed (2026-10-27)

| Task | Role | Status | Files Affected |
|------|------|--------|----------------|
| Hapus `src/WebTerminal.jsx` | FE | 🟢 | WebTerminal.jsx |
| Hapus terminal & agent integration tabs dari `App.jsx` | FE | 🟢 | App.jsx |
| Hapus `mcp_server.js` | BE | 🟢 | mcp_server.js |
| Hapus route `/api/agents/*` & WebSocket dari `api.js` | BE | 🟢 | api.js |
| Sederhanakan `cli.js` | BE | 🟢 | cli.js |
| Update packages: uninstalled `ws`, `xterm`, `@modelcontextprotocol/sdk`; installed `openai`, `multer`, `officeparser`, `xlsx`, `dotenv`, `nes.css` | BE | 🟢 | package.json |

---

## Phase 2 — Backend Core
> Status: 🟢 Completed (2026-10-27)

| Task | Role | Status | Notes |
|------|------|--------|-------|
| Modular routes `api/routes/config.js`, `kb.js`, `he.js` | BE | 🟢 | Clean Express routing |
| Modular services `api/services/config.js`, `kb-parser.js`, `crawler.js`, `ai.js` | BE | 🟢 | Separation of concerns |
| Multi-format KB parser (PPT, PPTX, PDF, DOCX, TXT, MD) | BE | 🟢 | via `officeparser` |
| Crawler Puppeteer DOM & screenshot extractor | BE | 🟢 | Automated test case capture |
| AI SSE streaming & structured findings JSON parser | BE | 🟢 | Real-time chunks |
| Direct Excel export endpoint (`.xlsx`) | BE | 🟢 | via `xlsx` |

---

## Phase 3 — Frontend Core
> Status: 🟢 Completed (2026-10-27)

| Task | Role | Status | Notes |
|------|------|--------|-------|
| `src/components/Sidebar.jsx` (3 menus: HE, KB, AI Config) | FE | 🟢 | Status AI Agent indicator |
| `src/pages/HEChat.jsx` (Prompt, real-time log, findings table, Excel export) | FE | 🟢 | Separate columns, scrollable table |
| `src/pages/KnowledgeBase.jsx` (Drag & drop uploader, in-app preview) | FE | 🟢 | Multi-format RAG CMS |
| `src/pages/ModelConfig.jsx` (OpenAI / Groq / Ollama presets, test connection) | FE | 🟢 | Masked API Key & `.env` sync |

---

## Phase 4 — Visuals & High-Readability 8-Bit NES Theme
> Status: 🟢 Completed (2026-10-27)

| Task | Role | Status | Notes |
|------|------|--------|-------|
| Integrasi NES.css (`nes.css` npm package) | UX/FE | 🟢 | Authentic 8-bit styling |
| Dual-font typography hierarchy | UX/FE | 🟢 | `'Press Start 2P'` headers + `'Inter'` body readability |
| Pisahkan Detail Masalah vs Rekomendasi | UX/FE | 🟢 | 2 dedicated columns |
| Horizontal Scroll Table (`min-width: 1300px`, `overflow-x: auto`) | UX/FE | 🟢 | Responsive, no text truncations |
| Ganti Status Oracle → Status AI Agent | UX/FE | 🟢 | Clear terminology |
| Hapus subtitle "8-BIT HEURISTIC EVAL" | UX/FE | 🟢 | Minimalist brand header |

---

## Phase 5 — Verification & Release
> Status: 🟡 In Progress

| Task | Role | Status | Notes |
|------|------|--------|-------|
| End-to-end verification (Backend + Frontend) | All | 🟢 | Verified HTTP 200, export Excel tested |
| Build check (`npm run build`, `npm run lint`) | BE/FE | 🟢 | 0 errors |
| Git commit on `mini` | All | 🟡 | Ready to commit |
| Merge `mini` → `main` | All | 🔴 | Next step |
