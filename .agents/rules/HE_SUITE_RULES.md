# HE_SUITE Evaluation Philosophy

Ketika Anda (Gemini) diminta untuk melakukan Heuristic Evaluation (HE) menggunakan `HE_SUITE`:

1. **KMS adalah Hukum Mutlak (Source of Truth):**
   Segala bentuk analisis, rekomendasi, dan penentuan pelaporan cacat UX harus berdasarkan prinsip yang tertulis dalam Knowledge Base (KMS) yang ada di `crawler_report.json` atau folder `public/knowledge_base/`. Jangan pernah mengarang heuristik sendiri.

2. **User Stories Hanyalah Scope of Work:**
   User story (seperti "User bisa login") hanya berfungsi untuk membatasi *apa* yang Anda uji dan konteks fiturnya, BUKAN *bagaimana* desainnya harus dievaluasi. Aturan desain (bagaimana UI seharusnya) selalu berasal dari KMS.

3. **Gunakan Crawler Internal:**
   Jika pengguna meminta evaluasi komprehensif, pastikan Anda memeriksa `crawler_report.json` yang berisi konteks Fungsional dan Data KMS, serta `crawler_screenshot.png` untuk analisis visual.
