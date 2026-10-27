# HE SUITE (Branch: `mini`)

HE SUITE adalah platform **Heuristic Evaluation & UI/UX Audit** berbasis AI dengan antarmuka retro 8-bit (NES.css). Dilengkapi dengan:
1. **Evaluasi HE (Chat Box)**: Evaluasi website otomatis via prompt bebas dengan ekstraksi test cases otomatis, crawler Puppeteer, streaming AI, tabel temuan terstruktur, dan ekspor Excel (`.xlsx`) / JSON.
2. **Knowledge Base CMS**: Upload pedoman audit (PPT, PPTX, PDF, DOCX, TXT, MD) untuk memperkaya analisis RAG model AI, dilengkapi modal pratinjau teks in-app.
3. **Model AI & API Key CMS**: Konfigurasi OpenAI-compatible provider (OpenAI, Groq, Ollama, OpenRouter, dll.) dengan preset 1-klik dan live connection test.

---

## ⚡ Panduan Instalasi Cepat (Quick Start)

### 1. Prasyarat
- Komputer terpasang **Node.js** (versi 18 ke atas) & **Git**.
  - Download Node.js: [nodejs.org](https://nodejs.org/) (pilih versi LTS)
  - Download Git: [git-scm.com](https://git-scm.com/)

---

### 2. Download Branch `mini`

Buka **Terminal** (Mac/Linux) atau **PowerShell / Git Bash / Command Prompt** (Windows), lalu jalankan:

```bash
# Clone khusus branch mini
git clone -b mini https://github.com/agungarifr/HE_SUITE.git

# Masuk ke direktori project
cd HE_SUITE
```

*(Atau via browser: kunjungi https://github.com/agungarifr/HE_SUITE/tree/mini lalu klik tombol hijau **Code** -> **Download ZIP**, ekstrak filenya, lalu buka foldernya di terminal).*

---

### 3. Install Dependensi & Jalankan

```bash
# 1. Install semua package yang dibutuhkan
npm install

# 2. Build aset frontend (opsional jika sudah ada dist/)
npm run build

# 3. Jalankan server HE SUITE
npm start
```

Aplikasi akan aktif di:
👉 **`http://localhost:8888`**

Buka link tersebut di browser Anda (Chrome, Edge, Firefox, Safari).

---

## 🤖 Menggunakan Google Gemini Web Sebagai Asisten Instalasi (Untuk Pemula)

Bagi pengguna baru (*new user*) yang belum terbiasa dengan terminal atau ragu saat menginstal, Anda bisa memanfaatkan **[Google Gemini Web](https://gemini.google.com)** sebagai pemandu pribadi.

### 💡 Catatan & Batasan Gemini Web:
- **Yang BISA dilakukan Gemini Web**:
  - Memberikan panduan langkah demi langkah yang sangat ramah pemula sesuai sistem operasi Anda (Windows, Mac, atau Linux).
  - Mendiagnosis pesan error (cukup *copy-paste* error dari terminal ke Gemini Web untuk mendapatkan solusinya).
  - Membantu Anda cara mendapatkan API Key (OpenAI, Groq, dll.) dan cara mengisinya.
- **Yang TIDAK BISA dilakukan Gemini Web**:
  - Gemini Web berjalan di cloud browser, sehingga **tidak bisa mengeksekusi perintah terminal langsung di komputer Anda**. Anda tetap perlu membuka Terminal / PowerShell dan menempelkan (*paste*) perintah yang diberikan.

### 📋 Template Prompt untuk Google Gemini Web
Copy dan paste teks berikut ke chat [Google Gemini Web](https://gemini.google.com):

```text
Halo Gemini! Saya pemula dan ingin menjalankan project Node.js "HE SUITE" (branch mini) di komputer saya.
Sistem operasi saya: [Windows 11 / macOS / Ubuntu].

Tolong pandu saya dari awal langkah demi langkah:
1. Cara mengecek apakah Node.js dan Git sudah terpasang di komputer saya.
2. Cara mendownload/clone branch `mini` dari repository: https://github.com/agungarifr/HE_SUITE.git
3. Cara membuka terminal di folder tersebut dan menjalankan `npm install`.
4. Cara menjalankan server dengan `npm start` sampai bisa dibuka di browser http://localhost:8888.

Tolong berikan perintah satu per satu secara berurutan dan jelaskan apa yang harus saya lakukan. Jika saya menemukan error di terminal, saya akan menempelkan pesan errornya ke sini untuk dibantu.
```

---

## ⚙️ Konfigurasi Model AI (Di Dalam Aplikasi)

Setelah aplikasi terbuka di `http://localhost:8888`:
1. Masuk ke tab **MODEL AI & KEY** pada sidebar.
2. Pilih preset penyedia Anda:
   - **OpenAI**: Masukkan API Key OpenAI (`sk-...`), model default `gpt-4o-mini`.
   - **Groq**: Masukkan API Key Groq (`gsk_...`), model `llama-3.3-70b-versatile` (sangat cepat & hemat biaya).
   - **Ollama (Lokal)**: Tanpa API key, Base URL `http://localhost:11434/v1`, model contoh `llama3`.
3. Klik **TES KONEKSI**. Jika berhasil, klik **SIMPAN KONFIGURASI**. Konfigurasi tersimpan aman di file `.env`.

---

## 🚀 Menjalankan Evaluasi HE Pertama Anda

1. Buka tab **EVALUASI HE**.
2. Masukkan instruksi pada chat box, contoh:
   > `lakukan he untuk website https://example.com, dengan case: login, register, checkout produk`
3. Klik **MULAI EVALUASI**.
4. Sistem akan otomatis:
   - Mengambil tangkapan layar & error DOM menggunakan Puppeteer crawler.
   - Menggabungkan data dengan pedoman dari Knowledge Base.
   - Menghasilkan analisis heuristik terperinci melalui AI.
   - Menampilkan tabel temuan (dipisah antara **Detail Masalah** dan **Rekomendasi Perbaikan**).
5. Klik **EKSPOR EXCEL (.XLSX)** untuk mengunduh laporan formal.

---

## 📂 Dokumentasi Teknis

- [CHANGELOG.md](file:///c:/Users/game/Desktop/hesuite/CHANGELOG.md) — Riwayat perubahan versi dan pembaruan arsitektur.
- [ROADMAP.md](file:///c:/Users/game/Desktop/hesuite/ROADMAP.md) — Rencana tahapan rilis dan status fitur.
- [CODEGRAPH.md](file:///c:/Users/game/Desktop/hesuite/CODEGRAPH.md) — Pemetaan arsitektur komponen, data flow, dan ketergantungan modul.
