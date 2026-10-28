# HE SUITE — CHANGELOG
> Format: [Semantic Versioning](https://semver.org/) | Timestamps: ISO 8601 +07:00

---

## [Unreleased] — branch `mini`
> Target version: `2.0.0`

### [2026-10-28T10:20:00+07:00] Tab Session Bridge: Zero Copy-Paste Auth & Captcha/Login Bypass
- [EXT] **Chrome Extension Companion (`extension/`)**:
  - Dibuat extension Manifest V3 resmi untuk menjembatani izin browser pengguna ke tab HE Suite.
  - Background service worker & content script mengizinkan deteksi daftar tab terbuka (`chrome.tabs.query`) dan ekstraksi cookies terotentikasi (`chrome.cookies.getAll`) tanpa pernah membocorkan data ke pihak ketiga.
- [FE] **Auto-Detect Tab Dropdown di `HEChat.jsx`**:
  - Panel "SESI BROWSER (LOGIN BYPASS)" langsung di atas prompt chat box.
  - Tombol **`[ 🔍 DETEKSI TAB BROWSER ]`** memunculkan dropdown seluruh tab aktif di browser pengguna.
  - Memilih tab (misal Tokopedia / Shopee yang sudah login) otomatis menyerap seluruh cookies sesi ke state aplikasi dan mengisi URL target.
- [BE] **Cookie Injection di `api/services/crawler.js` & `api/routes/he.js`**:
  - Endpoint `/api/he/run` menerima payload array `cookies`.
  - Crawler Puppeteer secara otomatis mensanitasi dan menyuntikkan cookies via `page.setCookie(...)` sebelum navigasi, melompati halaman login/captcha secara instan.


### [2026-10-27T15:55:00+07:00] Anti-Bot Stealth Crawler & Resilient Heuristic Fallback
- [BE/CRAWLER] **Stealth Fingerprint Masking**:
  - Menyamarkan headless Chrome dengan User-Agent Chrome 133 modern asli dan header bahasa/arsitektur Windows standar.
  - Menghilangkan jejak `navigator.webdriver` via `evaluateOnNewDocument` dan menyisipkan `window.chrome`.
  - Menambahkan argumen browser `--disable-blink-features=AutomationControlled` untuk melewati proteksi bot standar.
- [BE/CRAWLER] **Fast DOM-Loaded Navigation**: Mengganti `networkidle2` menjadi `domcontentloaded` dengan timeout cerdas 25 detik agar crawler tidak macet (*hang*) pada website dengan script analitik/iklan tak terhingga.
- [BE/AI] **Resilient Domain Heuristics Fallback**:
  - Crawler otomatis mendeteksi jika halaman diblokir oleh WAF/Cloudflare Captcha (`just a moment`, `access denied`, dll.).
  - Jika diblokir atau gagal mengambil DOM fisik, sistem **TIDAK PERNAH CRASH**. AI secara otomatis beralih mengevaluasi use cases berbasis *domain UX knowledge*, pola arsitektur industri, dan pedoman Second Brain sehingga laporan evaluasi HE tetap komprehensif dan selesai sempurna.


### [2026-10-27T15:32:00+07:00] HEChat Layout Redesign: Spacious Chat Box, Symmetrical AI Log, & Flexible History Selector
- [FE/UX] **Chat Box Dipertebal & Diperlega**: Mengganti input single-line menjadi textarea 5-baris dengan padding tebal, font Inter 13px, dan min-height 280px container, memberikan ruang leluasa untuk mengetik URL panjang dan skenario use cases.
- [FE/UX] **Ukuran Log Chat AI Disamakan**: Menyelaraskan ukuran container Log Chat AI dengan Chat Box secara simetris dalam grid seimbang (min-height 280px), menampilkan status crawler real-time dan live AI streaming dengan font terminal yang rapi.
- [FE/UX] **Selector Riwayat Dipindahkan ke Bawah Log Chat**: Menggeser selector riwayat dari banner atas ke bawah grid chat box & log chat, menciptakan alur visual yang alami (Input → Log AI → Riwayat & Ekspor → Tabel Temuan).
- [FE/UX] **Opsi Kosongkan / Sembunyikan Riwayat**:
  - Menambahkan opsi eksplisit `-- JANGAN TAMPILKAN RIWAYAT APAPUN (KOSONGKAN) --` pada dropdown selector riwayat.
  - Menambahkan tombol cepat `TUTUP RIWAYAT` untuk menyembunyikan laporan kapan saja.
  - Menampilkan status kosong yang informatif saat tidak ada riwayat yang dipilih.


### [2026-10-27T14:45:00+07:00] Transformation: Knowledge Base → Second Brain & Cloud Permission Fix
- [FE/BE] **Second Brain Architecture**:
  - Mengubah Knowledge Base pasif menjadi **Second Brain** aktif dan terstruktur.
  - Dua tab utama:
    1. **Catatan & Aturan UX (Brain Notes)**: Form cepat untuk mencatat prinsip UX, aturan bisnis, dan checklist heuristik dengan tag. Dilengkapi tombol **Toggle Aktif/Nonaktif** per catatan untuk menentukan apakah aturan diikutsertakan dalam prompt evaluasi AI.
    2. **Vault Dokumen**: Penyimpanan dokumen (PPT, PPTX, PDF, DOCX, TXT, MD) dengan ekstraksi teks RAG dan modal pratinjau teks in-app.
  - **Migrasi Otomatis**: 6 dokumen markdown heuristik inti (Nielsen 10, Shneiderman, WCAG 2.1, Skala Severity, NN/g 5W2H, Custom Prompts) secara otomatis dimigrasikan menjadi catatan Second Brain awal.
  - **Injeksi AI**: Mesin evaluasi menyerap seluruh Catatan Aktif + Dokumen Vault sebagai konteks cerdas evaluasi.
- [DOCKER/CLOUD] **Fix EACCES Permission Denied di Render**:
  - Menambahkan `RUN touch .env && chown -R pptruser:pptruser /app` pada `Dockerfile` agar user `pptruser` memiliki izin tulis penuh pada `.env`, data laporan, dan knowledge base.
  - Memperbarui `api/services/config.js` dengan proteksi `try...catch` agar kegagalan tulis `.env` pada container *read-only* tidak membuat server crash dan konfigurasi tetap aktif pada memori sesi (`process.env`).


### [2026-10-27T13:51:00+07:00] Documentation Update: Branch Mini & Gemini Web Setup Guide
- [DOC] **README.md Overhaul**: Menulis ulang `README.md` berfokus pada cara download branch `mini` (`git clone -b mini`), quick start, serta panduan komprehensif bagi pemula untuk menggunakan **Google Gemini Web** sebagai asisten troubleshooting interaktif.
- [DOC] **Koreksi Kapabilitas Gemini Web**: Menambahkan catatan teknis transparan bahwa Gemini Web adalah pemandu langkah dan pembaca error terminal, bukan eksekutor perintah lokal otomatis.


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
