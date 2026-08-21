# HE_SUITE Evaluation Philosophy

Ketika Anda (Gemini) diminta untuk melakukan Heuristic Evaluation (HE) menggunakan `HE_SUITE`:

1. **KMS adalah Hukum Mutlak (Source of Truth):**
   Segala bentuk analisis, rekomendasi, dan penentuan pelaporan cacat UX harus berdasarkan prinsip yang tertulis dalam Knowledge Base (KMS) yang ada di `crawler_report.json` atau folder `public/knowledge_base/`. Jangan pernah mengarang heuristik sendiri.

2. **IKUTI USER STORIES SEBAGAI PANDUAN UTAMA:**
   Selalu baca dan jadikan User Stories yang ada (misal: "User bisa login") sebagai skenario dan pedoman utama evaluasi Anda. User Stories menentukan batasan fitur dan alur kerja apa yang harus Anda ikuti/uji secara ketat, sementara aturan desain UI-nya diambil dari KMS.

3. **Gunakan Crawler Internal:**
   Jika pengguna meminta evaluasi komprehensif, pastikan Anda memeriksa `crawler_report.json` yang berisi konteks Fungsional dan Data KMS, serta `crawler_screenshot.png` untuk analisis visual.

4. **DILARANG MONOLOG:**
   Langsung ke inti permasalahan. Jangan mencetak "<think>", proses berpikir, atau monolog internal Anda ke pengguna. Berikan respons akhir yang singkat, padat, dan jelas (Concise and Direct).
