# Heuristic Evaluation Report: DigitalPass

**Product:** DigitalPass (digitalpass.id)
**Evaluator:** Buffy (AI Heuristic Auditor)
**Date:** August 20, 2026
**Framework:** Nielsen's 10 Usability Heuristics + Shneiderman's 8 Golden Rules + WCAG POUR
**Scope:** Landing Page & Login Flow (US001, US8256)

---

## 1. Executive Summary

DigitalPass adalah platform digital yang menawarkan layanan-layanan tertentu kepada pengguna. Berdasarkan crawler data dan analisis heuristic terhadap halaman landing dan flow login, ditemukan **10 temuan** dengan distribusi severity sebagai berikut:

- **Severity 4 (Usability Catastrophe):** 2 temuan — termasuk JavaScript error kritis dan tombol duplikat yang membingungkan
- **Severity 3 (Major):** 3 temuan — privacy policy缺失, informasi pricing/demo tidak ada, dan fitur show/hide password tidak tersedia
- **Severity 2 (Minor):** 4 temuan — login friction, error feedback, analytics error, keyboard accessibility
- **Severity 1 (Cosmetic):** 1 temuan — ketiadaan search bar

**Rekomendasi:** Beberapa temuan severity 4 harus diperbaiki sebelum rilis karena berdampak langsung pada keandalan aplikasi dan kebingungan pengguna.

---

## 2. Findings Summary Table

| ID | Severity | Heuristic | Issue | Context |
|---|---|---|---|---|
| HE-FUNC-1 | **4** | Functional | JavaScript error saat load halaman | Global |
| HE-NEW-1 | **4** | H5: Error Prevention | Tombol 'Ajukan Layanan' muncul 2x tanpa pembeda | US8256 |
| HE-5914 | **3** | H4: Consistency & Standards | Tidak ada Privacy Policy & T&C di login | US001 |
| HE-NEW-2 | **3** | H8: Aesthetic & Minimalist | Tidak ada info Harga & Demo di Landing | US8256 |
| HE-NEW-3 | **3** | H5: Error Prevention | Tidak ada fitur show/hide password | US001 |
| HE-5908 | **2** | H7: Flexibility & Efficiency | Login Email/Password memerlukan ekstra klik | US001 |
| HE-NEW-4 | **2** | H9: Help Users Recover from Errors | Tidak ada feedback error untuk login gagal | US001 |
| HE-FUNC-2 | **2** | Functional | Google Analytics tracking gagal | Global |
| HE-NEW-5 | **2** | H7: Flexibility & Efficiency | Tidak ada keyboard shortcut/accessibility | Global |
| HE-NEW-6 | **1** | H10: Help & Documentation | Tidak ada search bar atau help center | Global |

---

## 3. Detailed Findings

### HE-FUNC-1: JavaScript Error Saat Load Halaman (Severity 4 — Usability Catastrophe)

> *Sangat penting untuk diperbaiki sebelum dirilis; contoh: payment, add to cart, register*

**Description:** Pada saat halaman utama digitalpass.id dimuat, terjadi JavaScript error: `"Cannot read properties of undefined (reading 'prototype')"`. Error ini terjadi di sisi client dan mengindikasikan ada library atau dependency yang gagal dimuat atau diinisialisasi dengan benar. Meskipun halaman masih bisa menampilkan konten (SSR/CSR hybrid), error ini berpotensi memblokir fitur interaktif tertentu dan mengurangi keandalan aplikasi.

**Heuristic Violation:** *Error Prevention (Heuristic 5)* & *Visibility of System Status (Heuristic 1)* — Error yang tidak ditangkap dengan baik membuat user tidak mengetahui apakah fitur tertentu berfungsi atau tidak.

**Recommendation:** Investigasi stack trace error ini di browser console. Periksa apakah semua dependency ter-load dengan benar dan gunakan error boundary di React untuk graceful degradation.

---

### HE-NEW-1: Tombol 'Ajukan Layanan' Muncul 2 Kali Tanpa Pembeda (Severity 4 — Usability Catastrophe)

> *Sangat penting untuk diperbaiki sebelum dirilis*

**Description:** Pada halaman landing, terdapat dua tombol dengan teks `'Ajukan Layanan'` yang identik dan terlihat sama. Tidak ada perbedaan visual (warna, ikon, posisi) atau konteks yang membedakan keduanya. Ini menimbulkan kebingungan pengguna: tombol mana yang harus ditekan? Apakah keduanya mengarah ke tujuan yang sama?

**Heuristic Violation:** *Error Prevention (Heuristic 5)* — User bisa melakukan aksi yang salah tanpa disadari. Juga melanggar *Consistency and Standards (Heuristic 4)* karena tidak ada standar yang jelas untuk primary CTA.

**Shneiderman Violation:** *Rule #3 (Offer informative feedback)* & *Rule #5 (Prevent errors)* — Dua tombol identik tanpa pembeda tidak memberikan feedback yang cukup bagi user untuk membuat keputusan yang tepat.

**Recommendation:** Hapus salah satu tombol jika fungsinya sama, atau berikan label yang berbeda untuk membedakan tujuan masing-masing (contoh: `'Ajukan Layanan Baru'` vs `'Lanjutkan Pengajuan'`). Pastikan hanya ada satu primary CTA yang jelas per halaman.

---

### HE-5914: Tidak Ada Tautan Privacy Policy & Terms and Condition di Login (Severity 3 — Major Usability Problem)

> *Menjadi prioritas utama untuk diperbaiki; contoh: fungsi utama dan journey utama*

**Description:** Pada halaman login, tidak ditemukan tautan menuju Privacy Policy atau Terms and Conditions sesuai dengan persyaratan di User Story US001. Hanya ada tautan 'Hubungi Kami' jika terjadi kendala. Ini melanggar standar industri dan persyaratan acceptance criteria US001: `"terdapat privacy policy dan atau terms and condition"`. Sebagai produk digital yang mengumpulkan data pengguna (email, NIK), ketiadaan legal notice merupakan risiko compliance.

**Heuristic Violation:** *Consistency and Standards (Heuristic 4)* — Standar industri untuk semua produk digital yang mengumpulkan data pengguna adalah menyertakan legal links di halaman login.

**WCAG Violation:** *Understandable / Predictable* — User harus bisa memprediksi bagaimana data mereka akan digunakan sebelum login.

**Recommendation:** Tambahkan tautan kecil di bagian bawah form login (footer) yang mengarah ke Privacy Policy dan Terms of Service.

---

### HE-NEW-2: Tidak Ada Informasi Harga (Pricing) dan Demo di Landing Page (Severity 3 — Major Usability Problem)

> *Menjadi prioritas utama untuk diperbaiki*

**Description:** Pada halaman landing page utama, deskripsi layanan sudah tersedia dan desain sangat minimalis. Namun, pengguna tidak dapat menemukan informasi harga/subscription atau tombol Demo produk. Ini melanggar kriteria di User Story US8256: `"Terdapat deskripsi produk, harga, demo, contact us untuk berlangganan"`. Tanpa pricing, user tidak bisa membuat keputusan purchasing. Tanpa demo, user tidak bisa mengevaluasi produk sebelum berlangganan.

**Heuristic Violation:** *Aesthetic and Minimalist Design (Heuristic 8)* — Desain yang terlalu minimalis menghilangkan informasi yang relevan dan diperlukan pengguna.

**Shneiderman Violation:** *Rule #2 (Seek universal usability)* — Tidak semua user tahu cara menghubungi sales; pricing yang transparan memberikan experience yang lebih baik untuk semua level user.

**Recommendation:** Tambahkan bagian Pricing Card di area utama landing page. Sediakan tombol CTA 'Coba Demo' atau 'Live Demo' yang prominent.

---

### HE-NEW-3: Tidak Ada Fitur Show/Hide Password di Form Login (Severity 3 — Major Usability Problem)

> *Menjadi prioritas utama untuk diperbaiki*

**Description:** Acceptance Criteria US001 secara eksplisit menyatakan: `"form password ada fitur show/hide password"`. Tanpa fitur ini, user tidak bisa memverifikasi input password mereka, meningkatkan risiko typing error — terutama pada mobile device di mana autocorrect sering mengubah input.

**Heuristic Violation:** *Error Prevention (Heuristic 5)* — Tanpa show/hide toggle, user tidak bisa memverifikasi input, meningkatkan risiko typing error.

**Recommendation:** Tambahkan ikon eye/eye-off toggle di sebelah kanan input password untuk memungkinkan user menampilkan atau menyembunyikan password mereka.

---

### HE-5908: Login Email/Password Memerlukan Ekstra Klik (Severity 2 — Minor Usability Problem)

> *Perbaikan dengan prioritas rendah*

**Description:** Form login terlihat minimalis dan bersih. Namun, tombol login default menggunakan 'Login via Microsoft'. Untuk login menggunakan Email atau NIK, pengguna harus menekan tombol tambahan terlebih dahulu. Hal ini mengurangi efisiensi bagi pengguna reguler (non-Microsoft) karena menambah langkah yang tidak perlu.

**Heuristic Violation:** *Flexibility and Efficiency of Use (Heuristic 7)* — Mayoritas pengguna Indonesia menggunakan email atau NIK, bukan Microsoft account. Default login yang memprioritaskan Microsoft mengurangi efisiensi untuk mayoritas user.

**Recommendation:** Tampilkan input teks untuk Email dan Password secara langsung di halaman utama login bersamaan dengan tombol opsi 'Login via Microsoft'.

---

### HE-NEW-4: Tidak Ada Feedback Error untuk Login Gagal (Severity 2 — Minor Usability Problem)

> *Perbaikan dengan prioritas rendah*

**Description:** Acceptance Criteria US001 menyatakan: `"Pesan error muncul jika password dan akun/id/email salah"`. Namun dari analisis crawler, tidak ditemukan adanya error state handling yang terlihat di UI. Ketika user memasukkan kredensial yang salah, tidak jelas apakah sistem akan menampilkan pesan error yang jelas.

**Heuristic Violation:** *Help Users Recognize, Diagnose, and Recover from Errors (Heuristic 9)* — User harus mendapatkan pesan yang jelas dan actionable ketika terjadi error.

**Recommendation:** Implementasikan error message yang muncul di bawah form login dengan pesan yang spesifik (contoh: `"Email atau password salah"`) dan saran pemulihan (`"Lupa password? Reset disini"`).

---

### HE-FUNC-2: Google Analytics Tracking Gagal (Severity 2 — Minor Usability Problem)

> *Perbaikan dengan prioritas rendah*

**Description:** Request ke Google Analytics menghasilkan error `net::ERR_ABORTED`. Tracking data tidak terkirim ke GA, sehingga data analitik untuk pengambilan keputusan produk tidak lengkap.

**Recommendation:** Pastikan GA4 measurement ID terkonfigurasi dengan benar. Cek apakah ada CSP yang memblokir request ke google-analytics.com.

---

### HE-NEW-5: Tidak Ada Keyboard Shortcut/Accsessibility Navigation (Severity 2 — Minor Usability Problem)

> *Perbaikan dengan prioritas rendah*

**Description:** Tidak ditemukan adanya skip navigation links, aria landmarks, atau keyboard shortcut hints. WCAG 2.1 Level A mewajibkan keyboard operability.

**WCAG Violation:** *Operable / Keyboard Accessible* — Semua fungsi harus bisa diakses tanpa mouse.

**Recommendation:** Tambahkan skip-to-content link, pastikan semua interactive elements bisa diakses via keyboard, dan gunakan ARIA landmarks yang benar.

---

### HE-NEW-6: Tidak Ada Search Bar atau Help Center (Severity 1 — Cosmetic Problem Only)

> *Dapat diperbaiki ketika ada waktu luang*

**Description:** Tidak ditemukan search bar atau pusat bantuan di halaman landing. Untuk produk digital, user mungkin perlu mencari informasi spesifik tentang fitur atau cara penggunaan.

**Recommendation:** Tambahkan search bar di header atau halaman bantuan (Help Center/FAQ). Pertimbangkan juga chat widget untuk support instan.

---

## 4. Compliance Matrix

### US001 — User Login Flow

| Acceptance Criteria | Status | Finding |
|---|---|---|
| Form login terlihat | ✅ Pass | Tombol 'Masuk' terlihat |
| Pesan error muncul jika salah | ⚠️ Risk | HE-NEW-4: Error feedback belum diverifikasi |
| Ada Privacy Policy & T&C | ❌ Fail | HE-5914: Tidak ditemukan |
| Fitur show/hide password | ❌ Fail | HE-NEW-3: Tidak ditemukan |
| UI login遵循 HE-7, tidak overwhelming | ⚠️ Partial | HE-5908: Login friction dari Microsoft default |

### US8256 — Landing Page Browsing

| Acceptance Criteria | Status | Finding |
|---|---|---|
| Deskripsi produk tersedia | ✅ Pass | Layanan sudah dideskripsikan |
| Harga tersedia | ❌ Fail | HE-NEW-2: Tidak ada pricing |
| Demo tersedia | ❌ Fail | HE-NEW-2: Tidak ada demo |
| Contact us tersedia | ⚠️ Partial | Hanya 'Hubungi Kami' tanpa form |
| Desain遵循 HE-7, tidak overwhelming | ✅ Pass | Desain minimalis dan bersih |

---

## 5. Prioritization & Recommendations

### Critical (Fix Before Release)
1. **HE-FUNC-1** — Fix JavaScript error — aplikasi harus load tanpa error
2. **HE-NEW-1** — Hapus tombol duplikat atau berikan label berbeda

### High Priority (Fix in Current Sprint)
3. **HE-5914** — Tambahkan Privacy Policy & T&C links di login
4. **HE-NEW-2** — Tambahkan Pricing Card dan Demo CTA di landing
5. **HE-NEW-3** — Tambahkan fitur show/hide password

### Medium Priority (Fix in Next Sprint)
6. **HE-5908** — Optimasi login flow untuk Email/NIK users
7. **HE-NEW-4** — Implementasikan error feedback untuk login
8. **HE-FUNC-2** — Fix GA4 tracking
9. **HE-NEW-5** — Tambahkan keyboard accessibility

### Low Priority (Backlog)
10. **HE-NEW-6** — Tambahkan search bar atau help center

---

## 6. Heuristic Coverage Matrix

| Heuristic | Findings | Coverage |
|---|---|---|
| H1: Visibility of System Status | HE-FUNC-1 | 🟡 Partial |
| H2: Match Between System & Real World | — | 🟢 No violation found |
| H3: User Control & Freedom | — | 🟢 No violation found |
| H4: Consistency & Standards | HE-5914, HE-NEW-1 | 🔴 2 violations |
| H5: Error Prevention | HE-NEW-1, HE-NEW-3 | 🔴 2 violations |
| H6: Recognition Rather Than Recall | — | 🟢 No violation found |
| H7: Flexibility & Efficiency | HE-5908, HE-NEW-5 | 🟡 2 violations (minor) |
| H8: Aesthetic & Minimalist | HE-NEW-2 | 🟡 1 violation |
| H9: Help Recover from Errors | HE-NEW-4 | 🟡 1 violation |
| H10: Help & Documentation | HE-NEW-6 | 🟢 1 cosmetic issue |

---

*Report generated by HE_SUITE — August 20, 2026*
