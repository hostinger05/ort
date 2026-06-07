/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║      UPLOAD SCRIPT — Portal Akademik SMAN 5 Pinrang                 ║
 * ║                  upload_datasiswa.gs  (Google Apps Script)          ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  Script ini membaca data dari Google Sheet dan mengupload            ║
 * ║  ke GitHub sebagai file datasiswa.js.                                ║
 * ║                                                                      ║
 * ║  CARA PASANG:                                                        ║
 * ║  1. Buka Google Sheet data siswa                                     ║
 * ║  2. Menu Extensions → Apps Script                                    ║
 * ║  3. Tempel seluruh isi file ini, klik Save                           ║
 * ║  4. Jalankan fungsi uploadGanjil() atau uploadGenap()                ║
 * ║                                                                      ║
 * ║  CARA PAKAI OTOMATIS (opsional):                                     ║
 * ║  Tambahkan trigger: Triggers → uploadGanjil → Time-driven            ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * ⚠️  PENTING — KEAMANAN TOKEN:
 *   Jangan simpan token langsung di sini jika script-nya dibagikan.
 *   Gunakan PropertiesService (lihat fungsi setToken di bawah).
 *   Jalankan setToken() SEKALI dari editor, lalu hapus baris token-nya.
 */

// ════════════════════════════════════════════════════════════════════
//   KONFIGURASI
// ════════════════════════════════════════════════════════════════════

var CONFIG = {
  // ── Google Sheet ────────────────────────────────────────────────
  sheetId:       "1JQ3TbmT_8i0zEmKTCZA3w5D64BMQR-G-wUqguibHTX8",
  sheetGanjil:   "GANJIL",   // nama tab sheet semester ganjil
  sheetGenap:    "GENAP",    // nama tab sheet semester genap

  // ── GitHub ──────────────────────────────────────────────────────
  owner:    "hostinger05",
  repo:     "ortu",
  branch:   "main",
  filePath: "datasiswa.js",
};

// ════════════════════════════════════════════════════════════════════
//   MANAJEMEN TOKEN (simpan aman via PropertiesService)
// ════════════════════════════════════════════════════════════════════

/**
 * Jalankan fungsi ini SEKALI untuk menyimpan token secara aman.
 * Setelah dijalankan, hapus token dari sini agar tidak tersimpan
 * dalam source code script.
 */
function setToken() {
  var token = "GANTI_DENGAN_TOKEN_BARU_ANDA"; // ← ganti, jalankan sekali, lalu hapus
  PropertiesService.getScriptProperties().setProperty("GITHUB_TOKEN", token);
  Logger.log("✅ Token tersimpan aman di Script Properties.");
}

/** Ambil token dari Script Properties. */
function getToken() {
  var token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!token) {
    throw new Error(
      "❌ Token GitHub belum diset!\n" +
      "Jalankan fungsi setToken() terlebih dahulu."
    );
  }
  return token;
}

// ════════════════════════════════════════════════════════════════════
//   FUNGSI UTAMA — jalankan salah satu dari menu / trigger
// ════════════════════════════════════════════════════════════════════

/** Upload semester GANJIL saja (timpa data GANJIL, GENAP tetap). */
function uploadGanjil() {
  uploadSemester_("GANJIL");
}

/** Upload semester GENAP saja (timpa data GENAP, GANJIL tetap). */
function uploadGenap() {
  uploadSemester_("GENAP");
}

/** Upload KEDUA semester sekaligus. */
function uploadKeduaSemester() {
  var dataGanjil = bacaSheet_(CONFIG.sheetGanjil);
  var dataGenap  = bacaSheet_(CONFIG.sheetGenap);

  var finalData = { GANJIL: dataGanjil, GENAP: dataGenap };
  var jsContent = buildJs_(finalData);

  var sha = ambilSha_();
  uploadKeGithub_(jsContent, sha);
}

// ════════════════════════════════════════════════════════════════════
//   FUNGSI INTERNAL
// ════════════════════════════════════════════════════════════════════

function uploadSemester_(semester) {
  Logger.log("▶ Mulai upload semester: " + semester);

  // 1. Baca sheet semester baru
  var sheetName = (semester === "GANJIL") ? CONFIG.sheetGanjil : CONFIG.sheetGenap;
  var dataBaru  = bacaSheet_(sheetName);
  Logger.log("📊 Siswa terbaca: " + Object.keys(dataBaru).length);

  // 2. Ambil data existing dari GitHub (untuk merge semester lain)
  var sha          = null;
  var finalData    = { GANJIL: {}, GENAP: {} };
  var existingInfo = ambilFileGithub_();

  if (existingInfo) {
    sha       = existingInfo.sha;
    var parsed = parseExistingData_(existingInfo.content);
    finalData  = parsed;
    Logger.log("🔀 Merge: GANJIL existing=" + Object.keys(finalData.GANJIL).length +
               " | GENAP existing=" + Object.keys(finalData.GENAP).length);
  }

  // 3. Timpa semester yang dipilih
  finalData[semester] = dataBaru;

  // 4. Build JS dan upload
  var jsContent = buildJs_(finalData);
  uploadKeGithub_(jsContent, sha);
}

/**
 * Baca data dari satu tab sheet.
 * Baris 1 = header (dilewati), baris 2+ = data siswa.
 * Struktur kolom sama persis dengan format Excel di README.
 */
function bacaSheet_(namaSheet) {
  var ss    = SpreadsheetApp.openById(CONFIG.sheetId);
  var sheet = ss.getSheetByName(namaSheet);

  if (!sheet) {
    throw new Error("❌ Sheet '" + namaSheet + "' tidak ditemukan di spreadsheet.");
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("⚠️  Sheet '" + namaSheet + "' kosong (tidak ada data siswa).");
    return {};
  }

  // Ambil semua data sekaligus (lebih cepat dari getCell satu-satu)
  var data = sheet.getRange(2, 1, lastRow - 1, 59).getValues();
  var hasil = {};

  for (var i = 0; i < data.length; i++) {
    var row    = data[i];
    var nisn   = String(row[0] || "").trim();
    if (!nisn) continue;

    var password          = String(row[1]  || "").trim();
    var rawSchedule       = String(row[2]  || "").trim();
    var rawAttendanceData = String(row[3]  || "").trim();
    var rawAssessmentData = String(row[4]  || "").trim();
    var rawNotesData      = String(row[5]  || "").trim();
    var nilaiAmbang       = String(row[6]  || "").trim();
    // kolom 7 (index H) tidak dipakai

    // abList: kolom index 8–31 (24 kolom)
    var abList = [];
    for (var c = 8; c <= 31; c++) {
      abList.push(String(row[c] || "").trim());
    }

    // nlList: kolom index 32–55 (24 kolom)
    var nlList = [];
    for (var c = 32; c <= 55; c++) {
      nlList.push(String(row[c] || "").trim());
    }

    var nama            = String(row[56] || "").trim();
    var kelas           = String(row[57] || "").trim();
    var kehadiranAmbang = String(row[58] || "").trim();

    hasil[nisn] = {
      nisn:              nisn,
      password:          password,
      rawSchedule:       rawSchedule,
      rawAttendanceData: rawAttendanceData,
      rawAssessmentData: rawAssessmentData,
      rawNotesData:      rawNotesData,
      nilaiAmbang:       nilaiAmbang,
      nama:              nama,
      kelas:             kelas,
      kehadiranAmbang:   kehadiranAmbang,
      abList:            abList,
      nlList:            nlList,
    };

    Logger.log("  ✓ NISN " + nisn + " — " + nama + " (" + kelas + ")");
  }

  return hasil;
}

/** Ambil SHA + konten file datasiswa.js dari GitHub (untuk merge). */
function ambilFileGithub_() {
  var url = "https://api.github.com/repos/" +
            CONFIG.owner + "/" + CONFIG.repo +
            "/contents/" + CONFIG.filePath +
            "?ref=" + CONFIG.branch;

  var res = UrlFetchApp.fetch(url, {
    method:             "GET",
    headers:            { "Authorization": "Bearer " + getToken() },
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() === 404) {
    Logger.log("ℹ️  datasiswa.js belum ada di repo, akan dibuat baru.");
    return null;
  }
  if (res.getResponseCode() !== 200) {
    Logger.log("⚠️  Gagal ambil file: " + res.getResponseCode() + " " + res.getContentText());
    return null;
  }

  var meta    = JSON.parse(res.getContentText());
  var sha     = meta.sha;
  var content = Utilities.newBlob(Utilities.base64Decode(meta.content)).getDataAsString();
  return { sha: sha, content: content };
}

/** Ambil hanya SHA file (tanpa decode konten penuh). */
function ambilSha_() {
  var info = ambilFileGithub_();
  return info ? info.sha : null;
}

/** Parse window.SISWA_DATA dari isi JS yang sudah ada. */
function parseExistingData_(jsContent) {
  var match = jsContent.match(/window\.SISWA_DATA\s*=\s*(\{[\s\S]*?\});\s*$/m);
  if (!match) return { GANJIL: {}, GENAP: {} };
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    Logger.log("⚠️  Gagal parse JSON existing: " + e.message);
    return { GANJIL: {}, GENAP: {} };
  }
}

/** Bangun konten datasiswa.js dari object data. */
function buildJs_(siswaData) {
  var now     = new Date();
  var tgl     = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  var jsonStr = JSON.stringify(siswaData, null, 2);

  return "/**\n" +
    " * DATABASE SISWA — Portal Akademik SMAN 5 Pinrang\n" +
    " * File ini di-generate otomatis oleh upload_datasiswa.gs\n" +
    " * ⚠️  Jangan edit manual — gunakan script upload untuk memperbarui.\n" +
    " *\n" +
    " * Terakhir diperbarui: " + tgl + "\n" +
    " */\n\n" +
    "window.SISWA_DATA = " + jsonStr + ";\n";
}

/** Commit & push konten baru ke GitHub. */
function uploadKeGithub_(content, sha) {
  var url     = "https://api.github.com/repos/" +
                CONFIG.owner + "/" + CONFIG.repo +
                "/contents/" + CONFIG.filePath;
  var encoded = Utilities.base64Encode(Utilities.newBlob(content).getBytes());

  var payload = {
    message: "[portal] Update datasiswa.js via Apps Script",
    content: encoded,
    branch:  CONFIG.branch,
  };
  if (sha) payload.sha = sha;

  var res = UrlFetchApp.fetch(url, {
    method:             "PUT",
    contentType:        "application/json",
    headers:            { "Authorization": "Bearer " + getToken() },
    payload:            JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  if (res.getResponseCode() === 200 || res.getResponseCode() === 201) {
    var commitUrl = JSON.parse(res.getContentText()).commit.html_url;
    Logger.log("✅ Upload berhasil!");
    Logger.log("   Commit: " + commitUrl);
  } else {
    Logger.log("❌ Upload gagal: " + res.getResponseCode());
    Logger.log("   " + res.getContentText());
    throw new Error("Upload ke GitHub gagal. Lihat log untuk detail.");
  }
}

// ════════════════════════════════════════════════════════════════════
//   MENU KUSTOM DI GOOGLE SHEET (opsional)
// ════════════════════════════════════════════════════════════════════

/** Tambahkan menu "Portal" ke toolbar Google Sheet saat file dibuka. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🏫 Portal")
    .addItem("Upload Semester GANJIL",       "uploadGanjil")
    .addItem("Upload Semester GENAP",        "uploadGenap")
    .addSeparator()
    .addItem("Upload KEDUA Semester",        "uploadKeduaSemester")
    .addSeparator()
    .addItem("⚙ Simpan Token GitHub (sekali saja)", "setToken")
    .addToUi();
}
