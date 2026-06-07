# 🏫 Portal Akademik — SMAN 5 Pinrang

Versi **GitHub Pages** dari Portal Akademik Orang Tua / Siswa.  
Data diambil dari file `datasiswa.js` yang di-generate otomatis dari Google Sheet.

---

## 📁 Struktur File

```
/
├── index.html              ← Halaman portal (Vue.js, tidak perlu build)
├── datasiswa.js            ← Database siswa (di-generate otomatis, JANGAN edit manual)
├── config.js               ← Token GitHub untuk fitur ganti password (JANGAN di-commit!)
├── .env.example            ← Template konfigurasi (boleh di-commit)
└── .gitignore              ← Daftar file yang tidak ikut di-commit
```

> File `upload_datasiswa.py` dan `update-data.yml` sudah **tidak digunakan**.  
> Digantikan oleh `upload_datasiswa.gs` (Google Apps Script) yang berjalan langsung di Google Sheet.

---

## 🚀 Setup Awal (Pertama Kali)

### 1. Buat Repository GitHub (Private direkomendasikan!)

```bash
# Buat repo baru di github.com (pilih Private untuk keamanan data)
git clone https://github.com/hostinger05/ortu.git
cd ortu
```

> ⚠️ **Sangat disarankan menggunakan repo Private** karena `datasiswa.js`
> berisi nama, kelas, kehadiran, dan nilai siswa.

### 2. Aktifkan GitHub Pages

1. GitHub → Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)**
4. Klik **Save**

Portal tersedia di: `https://hostinger05.github.io/ortu/`

---

## 📊 Cara Upload Data Siswa (Google Apps Script)

### Langkah 1 — Pasang Script ke Google Sheet

1. Buka Google Sheet data siswa
2. Menu **Extensions → Apps Script**
3. Hapus semua isi yang ada, lalu tempel seluruh isi file `upload_datasiswa.gs`
4. Klik **Save** (ikon disket)

### Langkah 2 — Simpan Token GitHub (dilakukan sekali)

1. Buat GitHub Fine-Grained Token baru di:  
   `https://github.com/settings/tokens?type=beta`  
   - Repository access: hanya repo `ortu`  
   - Permissions → **Contents: Read and Write**

2. Di editor Apps Script, **ganti** baris berikut di fungsi `setToken()`:
   ```js
   var token = "GANTI_DENGAN_TOKEN_BARU_ANDA";
   ```
   dengan token yang baru saja dibuat.

3. Jalankan fungsi `setToken()` (klik ▶ Run)

4. Setelah berhasil, **hapus** nilai token dari kode dan klik Save lagi.  
   Token tersimpan aman di Script Properties, tidak terlihat di source code.

### Langkah 3 — Upload Data

Setelah script terpasang, akan muncul menu **🏫 Portal** di toolbar Google Sheet:

| Menu | Fungsi |
|------|--------|
| Upload Semester GANJIL | Timpa data GANJIL, GENAP tidak berubah |
| Upload Semester GENAP  | Timpa data GENAP, GANJIL tidak berubah |
| Upload KEDUA Semester  | Upload GANJIL + GENAP sekaligus |
| ⚙ Simpan Token GitHub  | Simpan token (cukup sekali) |

Atau jalankan manual dari editor Apps Script:
```
uploadGanjil()   ← untuk semester ganjil
uploadGenap()    ← untuk semester genap
```

---

## 🔁 Workflow Pembaruan Data Rutin

```
Admin update data di Google Sheet
          ↓
Klik menu 🏫 Portal → Upload Semester GANJIL / GENAP
          ↓
Apps Script baca Sheet → generate datasiswa.js → push ke GitHub
          ↓
GitHub Pages deploy otomatis (~1 menit)
          ↓
Portal siap diakses siswa / orang tua
```

---

## 📋 Format Kolom Google Sheet

Baris 1 = header (dilewati script). Data mulai dari baris 2.

| Kolom | Index | Isi |
|-------|-------|-----|
| A | 0 | NISN |
| B | 1 | Password (kosong = gunakan NISN) |
| C | 2 | rawSchedule |
| D | 3 | rawAttendanceData |
| E | 4 | rawAssessmentData |
| F | 5 | rawNotesData |
| G | 6 | nilaiAmbang |
| H | 7 | (tidak dipakai) |
| I–AF | 8–31 | abList (kehadiran per mapel, 24 kolom) |
| AG–BD | 32–55 | nlList (nilai per mapel, 24 kolom) |
| BE | 56 | Nama Siswa |
| BF | 57 | Kelas |
| BG | 58 | Batas % Kehadiran |

---

## 🔐 Keamanan

### File yang TIDAK boleh masuk GitHub

| File | Alasan |
|------|--------|
| `config.js` | Mengandung GitHub token untuk fitur ganti password |
| `.env` | Mengandung token dan secret |

Semua sudah terdaftar di `.gitignore`.

### Keamanan Token Apps Script

Token GitHub **tidak** disimpan di source code script. Script menggunakan
`PropertiesService` bawaan Google yang terenkripsi dan hanya bisa diakses
oleh script itu sendiri di akun Google Anda.

---

## 🔐 Fitur Ganti Password Siswa

- **Tanpa `config.js`**: Password hanya tersimpan di sesi browser (hilang saat logout)
- **Dengan `config.js`**: Password tersimpan permanen di `datasiswa.js` via GitHub API

Untuk menggunakan fitur ini:
1. Salin file `config.js` ke folder repo di komputer admin
2. Isi `token` dengan GitHub token (file ini sudah ada di `.gitignore`)
3. File **tidak akan** ikut ter-commit ke GitHub

---

## ❓ FAQ

**Q: Apakah siswa bisa melihat data siswa lain?**  
A: Tidak, karena login memerlukan NISN + password yang benar. Namun jika repo publik, file `datasiswa.js` bisa diakses langsung. Gunakan **repo private**.

**Q: Bagaimana jika lupa password?**  
A: Admin cukup kosongkan kolom password di Google Sheet untuk siswa tersebut, lalu upload ulang. Password akan kembali ke NISN.

**Q: Apakah bisa dipakai tanpa GitHub Pages?**  
A: Bisa, dengan membuka `index.html` langsung di browser, selama `datasiswa.js` ada di folder yang sama.

**Q: Script Apps Script berjalan di mana?**  
A: Di server Google, tidak perlu laptop admin menyala. Bisa juga dijadwalkan otomatis via Triggers di Apps Script.

---

*Portal Akademik SMAN 5 Pinrang — versi GitHub Pages + Google Apps Script*
