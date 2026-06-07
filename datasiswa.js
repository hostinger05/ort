/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        DATABASE SISWA — Portal Akademik SMAN 5 Pinrang          ║
 * ║                        datasiswa.js                             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  ⚠️  FILE INI BERISI DATA SISWA — SIMPAN DI REPO PRIVATE!      ║
 * ║  ⚠️  File ini di-generate otomatis oleh upload_datasiswa.gs     ║
 * ║      Jangan edit manual — gunakan script upload untuk update.   ║
 * ║                                                                  ║
 * ║  Format data per siswa:                                          ║
 * ║  "NISN": {                                                       ║
 * ║    nisn, password, rawSchedule, rawAttendanceData,              ║
 * ║    rawAssessmentData, rawNotesData, nilaiAmbang,                ║
 * ║    nama, kelas, kehadiranAmbang, abList[], nlList[]             ║
 * ║  }                                                               ║
 * ║                                                                  ║
 * ║  Keterangan format data:                                         ║
 * ║  - password: kosong ("") berarti default ke NISN                 ║
 * ║  - rawSchedule: "waktu@mapel@guru@status#waktu@mapel@guru@status"║
 * ║  - rawAttendanceData: "mapel@guru@H@HT@I@S@A@B#..."             ║
 * ║  - rawAssessmentData: "mapel@guru#..."                           ║
 * ║  - rawNotesData: "mapel@guru@tipe#isi%..."                       ║
 * ║  - abList: array per mapel, format "tgl1@tgl2@, kode1@kode2@"  ║
 * ║  - nlList: array per mapel, format "n1@n2@, ref1@ref2@"         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

window.SISWA_DATA = {

  // ═══════════════════════════════════════
  //   SEMESTER GANJIL (Juli – Desember)
  // ═══════════════════════════════════════
  "GANJIL": {

    // Data diisi otomatis oleh upload_datasiswa.gs
    // Jangan tambahkan data manual di sini

  },

  // ═══════════════════════════════════════
  //   SEMESTER GENAP (Januari – Juni)
  // ═══════════════════════════════════════
  "GENAP": {

    // Data diisi otomatis oleh upload_datasiswa.gs
    // Jangan tambahkan data manual di sini

  },

};
