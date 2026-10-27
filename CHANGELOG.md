# HE SUITE — CHANGELOG
> Format: [Semantic Versioning](https://semver.org/) | Timestamps: ISO 8601 +07:00

---

## [Unreleased] — branch `mini`
> Target version: `2.0.0`

### [2026-10-27T13:28:15+07:00] Table Split, Horizontal Scroll & UI Polish
- [FE/UX] **Pemisahan Kolom Temuan HE**: Memisahkan `DETAIL MASALAH` (berisi Judul Masalah & Deskripsi komprehensif) dan `REKOMENDASI PERBAIKAN` (kotak hijau beraksen dengan styling actionable guidance) ke dua kolom terpisah.
- [FE/UX] **Horizontal Scroll Container**: Mengatur tabel temuan dengan container `overflow-x: auto` dan lebar minimum `min-width: 1300px`, dilengkapi teks panduan "↔ Geser horizontal untuk melihat detail lengkap" agar tabel tidak terpotong dan nyaman dibaca pada semua resolusi layar.
- [FE/UX] **Status Label Update**: Mengubah label status sidebar dari `STATUS ORACLE` menjadi `STATUS AI AGENT` (`MODEL SIAP` / `KUNCI KOSONG`).
- [FE/UX] **Header Clean**: Menghapus subtitle `"8-BIT HEURISTIC EVAL"` dari sidebar header brand agar tampilan lebih minimalis dan fokus pada brand `HE SUITE`.

### [2026-10-27T13:23:45+07:00] Transition to NES.css (High-Readability 8-Bit Nintendo Style)
- [UX/FE] Mengganti RPGUI dengan **NES.css** (`nes.css` npm package) untuk mengatasi masalah kontras dan keterbacaan teks pixelate.
- [UX/FE] Menerapkan hierarki tipografi ganda:
  - Pixel font `'Press Start 2P'` eksklusif untuk judul, badge, teks tombol, dan header NES.
  - Font modern tajam `'Inter'` untuk seluruh deskripsi, temuan, rekomendasi masalah, log, dan input — memastikan keterbacaan 100% tanpa kelelahan mata.
- [UX/FE] Memperbarui elemen UI ke komponen NES otentik:
  - Kontainer `nes-container is-dark with-title` dan `is-rounded`.
  - Tombol pixel (`nes-btn is-primary`, `is-success`, `is-warning`, `is-error`).
  - Tabel temuan terstruktur kontras tinggi (`.nes-data-table`) dengan badge severitas pixel (`.sev-0` hingga `.sev-4`).
  - Ikon 8-bit native (`nes-icon coin`, `trophy`, `star`, `heart`).
- [CLEANUP] Menghapus aset RPGUI legacy (`public/rpgui/`, `dist/rpgui/`).
- [BUILD] `npm run build` sukses (513ms), 0 oxlint error, HTTP 200 terverifikasi pada `http://localhost:8888`.

### [2026-10-27T12:28:30+07:00] Phase 1, 2, and 3 Core Implementation Completed
- [BE] Teardown: menghapus legacy `mcp_server.js`, `src/WebTerminal.jsx`, dan endpoint deprecated (`/api/agents/*`, WebSocket).
- [BE] Package cleanup: uninstalled `ws`, `xterm`, `xterm-addon-fit`, `@modelcontextprotocol/sdk`. Installed `openai`, `multer`, `officeparser`, `xlsx`, `dotenv`.
- [BE] Arsitektur: Refactor `api.js` menjadi modular routes (`api/routes/config.js`, `api/routes/kb.js`, `api/routes/he.js`) dan services (`api/services/config.js`, `api/services/kb-parser.js`, `api/services/crawler.js`, `api/services/ai.js`).
- [BE] Fitur: Menambahkan multi-format parsing untuk PPT/PPTX/PDF/DOCX/TXT/MD via `officeparser`, SSE streaming untuk evaluasi HE, parser temuan JSON terstruktur, dan endpoint ekspor Excel (`.xlsx`) langsung via `xlsx`.
- [FE] Interface: Rombak frontend menjadi 3 tampilan inti (`HEChat.jsx`, `KnowledgeBase.jsx`, `ModelConfig.jsx`) dengan `Sidebar.jsx`.
- [FE] Fitur: SSE live progress & stream naratif, tabel temuan terstruktur dengan severity badges, pemilih riwayat evaluasi persisten, ekspor Excel dan JSON 1-klik, upload drag-and-drop dokumen dengan modal pratinjau teks in-app, serta preset penyedia OpenAI-kompatibel (OpenAI, Groq, Ollama) dengan tes koneksi real-time.
- [BUILD] Production build diverifikasi (`dist/` tergenerasi, ukuran bundle terpangkas >50%), seluruh endpoint HTTP 200 OK.

### [2026-10-27T12:23:45+07:00] Global Agent Rules Setup
- [RULES] Menambahkan global agent rules di `~/.gemini/config/AGENTS.md` dan `~/.gemini/config/GEMINI.md` yang mewajibkan penggunaan permanen:
  1. Skill `caveman` (komunikasi padat, singkat)
  2. Skill `ponytail` (kode minimal, anti over-engineering, YAGNI)
  3. Dokumentasi `codegraph` yang selalu terawat lintas sesi.
- [RULES] Menambahkan workspace rule `AGENTS.md` di root repositori.

### [2026-10-27T12:21:00+07:00] Specs Finalization & Planning Complete
- [DOC] Keputusan produk dikunci: Format output Tabel Terstruktur, dukungan format KB lengkap (PPTX, PDF, DOCX, TXT, MD), in-app preview, konfigurasi `.env`, riwayat laporan persisten, prompt input bebas dengan ekstraksi test case otomatis, dan ekspor Excel (.xlsx).
- [DOC] Master architecture codegraph dibuat memetakan AS-IS ke TO-BE.

---

## [1.0.0] — 2026-10-27T11:43:00+07:00
> Branch: `main` | Initial codebase
- Fitur awal: Dashboard temuan HE, User Stories CMS, Knowledge Base MD editor, Integrasi Agent MCP, Web Terminal xterm.js.
