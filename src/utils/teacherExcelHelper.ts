import * as XLSX from 'xlsx';
import { AdminUser, TeacherDutyCategory, TeacherActiveStatus, UserRole } from '../types';

export interface ParsedTeacherRowResult {
  rowNumber: number;
  data: Partial<AdminUser>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TeacherImportParseSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  results: ParsedTeacherRowResult[];
}

/**
 * 28 Standard Headers for Guru & Tenaga Kependidikan Kemdikbud / SIMPATIKA / Dapodik
 */
export const TEACHER_TEMPLATE_HEADERS = [
  'No',
  'Nama Lengkap & Gelar',
  'NIP',
  'NUPTK',
  'NIK',
  'Jenis Kelamin (L/P)',
  'Tempat Lahir',
  'Tanggal Lahir (YYYY-MM-DD)',
  'Nama Ibu Kandung',
  'Status Pernikahan',
  'Agama',
  'No HP / WhatsApp',
  'Email Aktif',
  'Alamat Domisili',
  'Status Kepegawaian',
  'Pangkat / Golongan',
  'Pendidikan Terakhir',
  'Jurusan / Prodi',
  'Perguruan Tinggi Asal',
  'TMT Pengangkatan',
  'TMT Tugas di Sekolah',
  'Kategori Penugasan',
  'Tingkat Kelas',
  'Mata Pelajaran',
  'Tugas Tendik',
  'Jabatan Resmi',
  'Hak Akses Sistem',
  'Status Keaktifan',
];

/**
 * Realistic and formatted example rows for all PTK categories
 */
export const SAMPLE_TEACHER_ROWS = [
  [
    1,
    'H. Marlisman, S.Pd., M.M.',
    '19680512 199103 1 005',
    '8445746648200002',
    '1409011205680001',
    'L',
    'Kuantan Singingi',
    '1968-05-12',
    'Hj. Fatimah',
    'Menikah',
    'Islam',
    '081268123456',
    'kepsek.sdn006@kemdikbud.go.id',
    'Desa Sungai Buluh RT 002 / RW 001, Singingi Hilir',
    'PNS (Pegawai Negeri Sipil)',
    'Pembina (IV/a)',
    'S2 / Magister',
    'Manajemen Pendidikan',
    'Universitas Riau',
    '1991-03-01',
    '2018-07-15',
    'Kepala Sekolah',
    '',
    '',
    '',
    'Kepala Sekolah (Penanggung Jawab Utama)',
    'admin',
    'Aktif',
  ],
  [
    2,
    'Dewi Anggraini, S.Pd.SD',
    '19901103 201502 2 009',
    '3542768670210083',
    '1409014311900002',
    'P',
    'Pekanbaru',
    '1990-11-03',
    'Siti Aminah',
    'Menikah',
    'Islam',
    '085278129012',
    'dewi.anggraini@sdn006.sch.id',
    'Perumahan Sungai Buluh Asri Blok B No. 4',
    'PNS (Pegawai Negeri Sipil)',
    'Penata Muda Tingkat I (III/b)',
    'S1 / Sarjana (D-IV)',
    'Pendidikan Guru Sekolah Dasar (PGSD)',
    'Universitas Terbuka',
    '2015-02-01',
    '2016-01-10',
    'Wali Kelas',
    'Kelas 1',
    '',
    '',
    'Wali Kelas 1 & Koordinator Kurikulum',
    'user',
    'Aktif',
  ],
  [
    3,
    'Ahmad Fauzi, S.Pd.I.',
    '19930718 201903 1 006',
    '4741771672130092',
    '1409011807930003',
    'L',
    'Kampar',
    '1993-07-18',
    'Nurhayati',
    'Menikah',
    'Islam',
    '082283456789',
    'ahmad.fauzi@sdn006.sch.id',
    'Jl. Poros Desa Sungai Buluh No. 18',
    'PPPK (Pegawai Pemerintah dg Perjanjian Kerja)',
    'Penata Muda (III/a)',
    'S1 / Sarjana (D-IV)',
    'Pendidikan Agama Islam (PAI)',
    'UIN Sultan Syarif Kasim Riau',
    '2019-03-01',
    '2019-04-01',
    'Guru Mapel',
    '',
    'Pendidikan Agama Islam & Budi Pekerti',
    '',
    'Guru Mapel Pendidikan Agama Islam',
    'user',
    'Aktif',
  ],
  [
    4,
    'Rahmat Hidayat, S.Kom.',
    '19920415 201902 1 008',
    '5239770671130041',
    '1409011504920004',
    'L',
    'Teluk Kuantan',
    '1992-04-15',
    'Rosnani',
    'Belum Menikah',
    'Islam',
    '081374567890',
    'operator.rahmat@sdn006.sch.id',
    'Dusun Suka Makmur, Desa Sungai Buluh',
    'Tenaga Honorer / Staf Teknis',
    '- (Non-PNS / Non-Golongan)',
    'S1 / Sarjana (D-IV)',
    'Sistem Informasi / Ilmu Komputer',
    'Universitas Islam Riau',
    '2019-02-01',
    '2019-02-01',
    'Tenaga Kependidikan',
    '',
    '',
    'Operator Dapodik & SIM Sekolah',
    'Tenaga Kependidikan - Operator Dapodik & TU',
    'admin',
    'Aktif',
  ],
];

/**
 * Petunjuk Pengisian Lembar Excel (Worksheet 2)
 */
export const TEACHER_TEMPLATE_INSTRUCTIONS = [
  {
    NO: 1,
    KOLOM: 'Nama Lengkap & Gelar',
    KEHARUSAN: 'WAJIB',
    KETERANGAN: 'Nama lengkap guru/tenaga kependidikan beserta gelar akademik depan/belakang.',
    CONTOH_NILAI: 'H. Marlisman, S.Pd., M.M.',
  },
  {
    NO: 2,
    KOLOM: 'NIP',
    KEHARUSAN: 'Opsional (PNS/PPPK)',
    KETERANGAN: 'Nomor Induk Pegawai 18 digit untuk ASN PNS/PPPK. Jika non-PNS/honorer dapat dikosongkan atau diisi tanda (-).',
    CONTOH_NILAI: '19680512 199103 1 005',
  },
  {
    NO: 3,
    KOLOM: 'NUPTK',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Nomor Unik Pendidik dan Tenaga Kependidikan (16 digit angka resmi Kemdikbud).',
    CONTOH_NILAI: '8445746648200002',
  },
  {
    NO: 4,
    KOLOM: 'NIK',
    KEHARUSAN: 'Direkomendasikan',
    KETERANGAN: '16 digit Nomor Induk Kependudukan sesuai KTP/Kartu Keluarga.',
    CONTOH_NILAI: '1409011205680001',
  },
  {
    NO: 5,
    KOLOM: 'Jenis Kelamin (L/P)',
    KEHARUSAN: 'WAJIB',
    KETERANGAN: 'Pilihan huruf "L" untuk Laki-laki atau "P" untuk Perempuan.',
    CONTOH_NILAI: 'L atau P',
  },
  {
    NO: 6,
    KOLOM: 'Tempat Lahir',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Kota atau Kabupaten tempat lahir sesuai KTP/Akta.',
    CONTOH_NILAI: 'Kuantan Singingi',
  },
  {
    NO: 7,
    KOLOM: 'Tanggal Lahir',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Format tanggal standar: YYYY-MM-DD (contoh: 1988-05-12) atau DD/MM/YYYY.',
    CONTOH_NILAI: '1988-05-12',
  },
  {
    NO: 8,
    KOLOM: 'Nama Ibu Kandung',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Nama ibu kandung untuk keperluan sinkronisasi data Dapodik Kemdikbud.',
    CONTOH_NILAI: 'Siti Aminah',
  },
  {
    NO: 9,
    KOLOM: 'Status Pernikahan',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Pilihan: Menikah, Belum Menikah, Duda / Janda.',
    CONTOH_NILAI: 'Menikah',
  },
  {
    NO: 10,
    KOLOM: 'Agama',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Pilihan: Islam, Kristen Protestan, Katolik, Hindu, Buddha, Khonghucu.',
    CONTOH_NILAI: 'Islam',
  },
  {
    NO: 11,
    KOLOM: 'No HP / WhatsApp',
    KEHARUSAN: 'Direkomendasikan',
    KETERANGAN: 'Nomor telepon/WhatsApp aktif yang dapat dihubungi sekolah.',
    CONTOH_NILAI: '081268123456',
  },
  {
    NO: 12,
    KOLOM: 'Email Aktif',
    KEHARUSAN: 'Direkomendasikan',
    KETERANGAN: 'Alamat email aktif. Jika dikosongkan, sistem akan membuatkan otomatis.',
    CONTOH_NILAI: 'dewi.anggraini@sdn006.sch.id',
  },
  {
    NO: 13,
    KOLOM: 'Alamat Domisili',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Alamat tempat tinggal lengkap, RT/RW, dan Desa/Kecamatan.',
    CONTOH_NILAI: 'Desa Sungai Buluh RT 002 / RW 001',
  },
  {
    NO: 14,
    KOLOM: 'Status Kepegawaian',
    KEHARUSAN: 'Direkomendasikan',
    KETERANGAN: 'Pilihan: PNS (Pegawai Negeri Sipil), PPPK, Guru Honorer Sekolah (Non-PNS), Guru Tetap Yayasan (GTY), Tenaga Honorer / Staf Teknis.',
    CONTOH_NILAI: 'PNS (Pegawai Negeri Sipil)',
  },
  {
    NO: 15,
    KOLOM: 'Pangkat / Golongan',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Contoh: Penata Muda (III/a), Penata Muda Tingkat I (III/b), Pembina (IV/a), atau - (Non-PNS).',
    CONTOH_NILAI: 'Pembina (IV/a)',
  },
  {
    NO: 16,
    KOLOM: 'Pendidikan Terakhir',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Pilihan: S1 / Sarjana (D-IV), S2 / Magister, S3 / Doktor, D3 / Diploma III, SMA / SMK.',
    CONTOH_NILAI: 'S1 / Sarjana (D-IV)',
  },
  {
    NO: 17,
    KOLOM: 'Jurusan / Prodi',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Nama jurusan/bidang studi ijazah tertinggi (contoh: PGSD, Pendidikan Matematika, PAI, Sistem Informasi).',
    CONTOH_NILAI: 'Pendidikan Guru Sekolah Dasar (PGSD)',
  },
  {
    NO: 18,
    KOLOM: 'Perguruan Tinggi Asal',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Nama universitas / institut / perguruan tinggi penerbit ijazah.',
    CONTOH_NILAI: 'Universitas Riau',
  },
  {
    NO: 19,
    KOLOM: 'TMT Pengangkatan',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Terhitung Mulai Tanggal pertama kali diangkat sebagai guru/pegawai (YYYY-MM-DD).',
    CONTOH_NILAI: '2015-02-01',
  },
  {
    NO: 20,
    KOLOM: 'TMT Tugas di Sekolah',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Terhitung Mulai Tanggal mulai bertugas di sekolah ini (YYYY-MM-DD).',
    CONTOH_NILAI: '2016-01-10',
  },
  {
    NO: 21,
    KOLOM: 'Kategori Penugasan',
    KEHARUSAN: 'WAJIB',
    KETERANGAN: 'Kategori tugas pokok di sekolah. Pilihan: Kepala Sekolah, Wali Kelas, Guru Mapel, Tenaga Kependidikan.',
    CONTOH_NILAI: 'Wali Kelas / Guru Mapel / Kepala Sekolah / Tenaga Kependidikan',
  },
  {
    NO: 22,
    KOLOM: 'Tingkat Kelas',
    KEHARUSAN: 'Khusus Wali Kelas',
    KETERANGAN: 'Diisi jika Kategori adalah "Wali Kelas". Pilihan: Kelas 1, Kelas 2, Kelas 3, Kelas 4, Kelas 5, Kelas 6.',
    CONTOH_NILAI: 'Kelas 1 (atau Kelas 2, Kelas 3, dst.)',
  },
  {
    NO: 23,
    KOLOM: 'Mata Pelajaran',
    KEHARUSAN: 'Khusus Guru Mapel',
    KETERANGAN: 'Diisi jika Kategori adalah "Guru Mapel". Contoh: Pendidikan Agama Islam & Budi Pekerti, PJOK, Bahasa Inggris, dll.',
    CONTOH_NILAI: 'Pendidikan Agama Islam & Budi Pekerti',
  },
  {
    NO: 24,
    KOLOM: 'Tugas Tendik',
    KEHARUSAN: 'Khusus Tendik',
    KETERANGAN: 'Diisi jika Kategori adalah "Tenaga Kependidikan". Contoh: Operator Dapodik & SIM Sekolah, Tata Usaha, Pustakawan, dll.',
    CONTOH_NILAI: 'Operator Dapodik & SIM Sekolah',
  },
  {
    NO: 25,
    KOLOM: 'Jabatan Resmi',
    KEHARUSAN: 'Direkomendasikan',
    KETERANGAN: 'Nama jabatan resmi yang tercetak di laporan, raport, dan kop surat.',
    CONTOH_NILAI: 'Wali Kelas 1 & Koordinator Kurikulum',
  },
  {
    NO: 26,
    KOLOM: 'Hak Akses Sistem',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Pilihan: "admin" (Akses penuh/Kepsek/Operator) atau "user" (Guru kelas/input nilai). Default: "user".',
    CONTOH_NILAI: 'admin atau user',
  },
  {
    NO: 27,
    KOLOM: 'Status Keaktifan',
    KEHARUSAN: 'Opsional',
    KETERANGAN: 'Pilihan: Aktif, Pensiun, Cuti, Mutasi Keluar, Nonaktif. Default: "Aktif".',
    CONTOH_NILAI: 'Aktif',
  },
];

/**
 * Generate and download formatted Excel Template (.xlsx) for Teachers & Staff
 */
export const downloadTeacherExcelTemplate = (schoolName: string = 'Sekolah') => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: DATA_GURU_TENDIK
  const aoaData = [
    TEACHER_TEMPLATE_HEADERS,
    ...SAMPLE_TEACHER_ROWS,
  ];

  const wsData = XLSX.utils.aoa_to_sheet(aoaData);

  // Set column widths matching 28 columns
  const colWidths = [
    { wch: 6 },  // 1: No
    { wch: 28 }, // 2: Nama Lengkap & Gelar
    { wch: 24 }, // 3: NIP
    { wch: 20 }, // 4: NUPTK
    { wch: 20 }, // 5: NIK
    { wch: 10 }, // 6: JK (L/P)
    { wch: 18 }, // 7: Tempat Lahir
    { wch: 15 }, // 8: Tanggal Lahir
    { wch: 20 }, // 9: Nama Ibu Kandung
    { wch: 18 }, // 10: Status Pernikahan
    { wch: 16 }, // 11: Agama
    { wch: 18 }, // 12: No HP / WhatsApp
    { wch: 28 }, // 13: Email Aktif
    { wch: 36 }, // 14: Alamat Domisili
    { wch: 26 }, // 15: Status Kepegawaian
    { wch: 24 }, // 16: Pangkat / Golongan
    { wch: 22 }, // 17: Pendidikan Terakhir
    { wch: 30 }, // 18: Jurusan / Prodi
    { wch: 26 }, // 19: Perguruan Tinggi Asal
    { wch: 15 }, // 20: TMT Pengangkatan
    { wch: 15 }, // 21: TMT Tugas di Sekolah
    { wch: 22 }, // 22: Kategori Penugasan
    { wch: 15 }, // 23: Tingkat Kelas
    { wch: 32 }, // 24: Mata Pelajaran
    { wch: 28 }, // 25: Tugas Tendik
    { wch: 32 }, // 26: Jabatan Resmi
    { wch: 16 }, // 27: Hak Akses Sistem
    { wch: 16 }, // 28: Status Keaktifan
  ];
  wsData['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsData, 'DATA_GURU_TENDIK');

  // Sheet 2: PETUNJUK_PENGISIAN
  const wsGuide = XLSX.utils.json_to_sheet(TEACHER_TEMPLATE_INSTRUCTIONS);
  wsGuide['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 20 },
    { wch: 60 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK_PENGISIAN');

  // Clean filename
  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `TEMPLATE_IMPORT_DATA_GURU_${cleanSchool}.xlsx`;

  XLSX.writeFile(wb, fileName);
};

/**
 * Export current teachers to formatted Excel spreadsheet
 */
export const exportTeachersToExcel = (
  teachers: AdminUser[] = [],
  schoolName: string = 'Sekolah'
) => {
  try {
    const list = Array.isArray(teachers) ? teachers : [];
    const wb = XLSX.utils.book_new();

    const teacherRows = list.map((t, index) => {
      // Map category label for excel export
      const catLabel = 
        t.kategoriTugas === 'kepala_sekolah' ? 'Kepala Sekolah' :
        t.kategoriTugas === 'wali_kelas' ? 'Wali Kelas' :
        t.kategoriTugas === 'guru_mapel' ? 'Guru Mapel' :
        t.kategoriTugas === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Wali Kelas';

      return [
        index + 1,
        t.nama || '',
        t.nip || '-',
        t.nuptk || '',
        t.nik || '',
        t.jenisKelamin || 'L',
        t.tempatLahir || '',
        t.tanggalLahir || '',
        t.namaIbuKandung || '',
        t.statusPernikahan || 'Menikah',
        t.agama || 'Islam',
        t.noHp || '',
        t.email || '',
        t.alamat || '',
        t.statusKepegawaian || 'PNS',
        t.pangkatGolongan || '-',
        t.pendidikanTerakhir || 'S1',
        t.jurusanPendidikan || '',
        t.ptAsal || '',
        t.tmtPengangkatan || '',
        t.tmtTugas || '',
        catLabel,
        t.tingkatKelas || '',
        t.mataPelajaran || '',
        t.tugasTendik || '',
        t.jabatan || '',
        t.role || 'user',
        t.status || 'Aktif',
      ];
    });

    const aoaData = [
      TEACHER_TEMPLATE_HEADERS,
      ...teacherRows,
    ];

    const wsData = XLSX.utils.aoa_to_sheet(aoaData);

    const colWidths = [
      { wch: 6 },
      { wch: 28 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 10 },
      { wch: 18 },
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 28 },
      { wch: 36 },
      { wch: 26 },
      { wch: 24 },
      { wch: 22 },
      { wch: 30 },
      { wch: 26 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 15 },
      { wch: 32 },
      { wch: 28 },
      { wch: 32 },
      { wch: 16 },
      { wch: 16 },
    ];
    wsData['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, wsData, 'DATA_GURU_TENDIK');

    // Guide sheet
    const wsGuide = XLSX.utils.json_to_sheet(TEACHER_TEMPLATE_INSTRUCTIONS);
    wsGuide['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 20 }, { wch: 60 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK_PENGISIAN');

    const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `DATA_GURU_DAN_TENDIK_${cleanSchool}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error('Gagal mengekspor data guru ke Excel:', err);
  }
};

/**
 * Format date string into YYYY-MM-DD
 */
function normalizeDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return str;
}

/**
 * Normalize duty category from text
 */
function normalizeCategory(val: any, jabatanText: string = ''): TeacherDutyCategory {
  const str = `${String(val || '')} ${jabatanText}`.toLowerCase();
  if (str.includes('kepala sekolah') || str.includes('kepsek')) return 'kepala_sekolah';
  if (str.includes('wali') || str.includes('kelas') || str.includes('guru kelas')) return 'wali_kelas';
  if (str.includes('mapel') || str.includes('mata pelajaran') || str.includes('pai') || str.includes('pjok') || str.includes('agama') || str.includes('olahraga')) return 'guru_mapel';
  if (str.includes('tendik') || str.includes('tu') || str.includes('operator') || str.includes('tata usaha') || str.includes('pustaka') || str.includes('administrasi')) return 'tenaga_kependidikan';
  return 'wali_kelas';
}

/**
 * Fuzzy column lookup helper
 */
function getColValue(row: any, ...keys: string[]): any {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return row[k];
    }
  }

  const rowKeys = Object.keys(row);
  for (const targetKey of keys) {
    const cleanedTarget = targetKey.toLowerCase().replace(/[\s_\-\.\/\(\)]/g, '');
    for (const rk of rowKeys) {
      const cleanedRk = rk.toLowerCase().replace(/[\s_\-\.\/\(\)]/g, '');
      if (cleanedRk === cleanedTarget) {
        if (row[rk] !== undefined && row[rk] !== null && String(row[rk]).trim() !== '') {
          return row[rk];
        }
      }
    }
  }

  return undefined;
}

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-sky-600',
  'bg-orange-600',
];

/**
 * Parse an Excel/CSV file into structured Teacher/AdminUser records
 */
export async function parseTeacherExcelOrCsvFile(file: File): Promise<TeacherImportParseSummary> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        // Find primary sheet
        const sheetName = workbook.SheetNames.find(
          (s) => !s.toLowerCase().includes('petunjuk') && !s.toLowerCase().includes('guide') && !s.toLowerCase().includes('instruksi')
        ) || workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error('Lembar kerja data guru tidak ditemukan.');
        }

        // Read sheet as 2D array
        const aoa: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (aoa.length === 0) {
          resolve({
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            results: [],
          });
          return;
        }

        // Find header row (usually row 0, or first row with text)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(aoa.length, 5); i++) {
          const rowStr = (aoa[i] || []).map(v => String(v).toLowerCase()).join(' ');
          if (rowStr.includes('nama') || rowStr.includes('nip') || rowStr.includes('guru') || rowStr.includes('jabatan')) {
            headerRowIndex = i;
            break;
          }
        }

        const headerRow = (aoa[headerRowIndex] || []).map((v) => String(v || '').trim());
        const dataRows = aoa.slice(headerRowIndex + 1).filter((r) => r.some((val) => String(val || '').trim() !== ''));

        if (dataRows.length === 0) {
          resolve({
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            results: [],
          });
          return;
        }

        const results: ParsedTeacherRowResult[] = [];
        let validCount = 0;
        let invalidCount = 0;

        dataRows.forEach((rowArray, index) => {
          const rowNumber = headerRowIndex + 1 + index + 1;
          const errors: string[] = [];
          const warnings: string[] = [];

          // Map column name to row value
          const rowDict: Record<string, any> = {};
          headerRow.forEach((colName, c) => {
            if (colName) {
              rowDict[colName] = rowArray[c];
            }
            rowDict[`COL_${c}`] = rowArray[c];
          });

          // Positional fallbacks if standard template order was used
          const namaVal = getColValue(rowDict, 'Nama Lengkap & Gelar', 'Nama Lengkap', 'Nama Guru', 'Nama', 'COL_1');
          const nipVal = getColValue(rowDict, 'NIP', 'Nomor Induk Pegawai', 'COL_2');
          const nuptkVal = getColValue(rowDict, 'NUPTK', 'COL_3');
          const nikVal = getColValue(rowDict, 'NIK', 'Nomor Induk Kependudukan', 'COL_4');
          const jkVal = getColValue(rowDict, 'Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'COL_5');
          const tempatLahirVal = getColValue(rowDict, 'Tempat Lahir', 'COL_6');
          const tglLahirVal = getColValue(rowDict, 'Tanggal Lahir (YYYY-MM-DD)', 'Tanggal Lahir', 'Tgl Lahir', 'COL_7');
          const ibuVal = getColValue(rowDict, 'Nama Ibu Kandung', 'Ibu Kandung', 'COL_8');
          const pernikahanVal = getColValue(rowDict, 'Status Pernikahan', 'Status Kawin', 'COL_9');
          const agamaVal = getColValue(rowDict, 'Agama', 'COL_10');
          const hpVal = getColValue(rowDict, 'No HP / WhatsApp', 'No HP', 'No WhatsApp', 'Nomor HP', 'Telepon', 'COL_11');
          const emailVal = getColValue(rowDict, 'Email Aktif', 'Email', 'E-Mail', 'COL_12');
          const alamatVal = getColValue(rowDict, 'Alamat Domisili', 'Alamat', 'COL_13');
          const kepegawaianVal = getColValue(rowDict, 'Status Kepegawaian', 'Kepegawaian', 'COL_14');
          const pangkatVal = getColValue(rowDict, 'Pangkat / Golongan', 'Pangkat Golongan', 'Pangkat', 'Golongan', 'COL_15');
          const pendidikanVal = getColValue(rowDict, 'Pendidikan Terakhir', 'Pendidikan', 'COL_16');
          const prodiVal = getColValue(rowDict, 'Jurusan / Prodi', 'Jurusan', 'Prodi', 'Program Studi', 'COL_17');
          const ptVal = getColValue(rowDict, 'Perguruan Tinggi Asal', 'Kampus', 'Universitas', 'COL_18');
          const tmtPengangkatanVal = getColValue(rowDict, 'TMT Pengangkatan', 'COL_19');
          const tmtTugasVal = getColValue(rowDict, 'TMT Tugas di Sekolah', 'TMT Tugas', 'COL_20');
          const kategoriVal = getColValue(rowDict, 'Kategori Penugasan', 'Kategori Tugas', 'Kategori', 'COL_21');
          const kelasVal = getColValue(rowDict, 'Tingkat Kelas', 'Kelas', 'Rombel', 'COL_22');
          const mapelVal = getColValue(rowDict, 'Mata Pelajaran', 'Mapel', 'COL_23');
          const tendikVal = getColValue(rowDict, 'Tugas Tendik', 'Tendik', 'COL_24');
          const jabatanVal = getColValue(rowDict, 'Jabatan Resmi', 'Jabatan', 'Tugas Tambahan', 'COL_25');
          const roleVal = getColValue(rowDict, 'Hak Akses Sistem', 'Hak Akses', 'Role', 'COL_26');
          const statusVal = getColValue(rowDict, 'Status Keaktifan', 'Status', 'COL_27');

          // Validation
          const rawNama = String(namaVal || '').trim();
          if (!rawNama) {
            errors.push('Nama guru wajib diisi.');
          }

          // Gender
          let cleanGender: 'L' | 'P' = 'L';
          if (jkVal) {
            const gStr = String(jkVal).trim().toUpperCase();
            if (gStr.startsWith('P') || gStr.includes('WANITA') || gStr.includes('PEREMPUAN')) {
              cleanGender = 'P';
            } else {
              cleanGender = 'L';
            }
          }

          // Dates
          const cleanTglLahir = normalizeDate(tglLahirVal);
          const cleanTmtPengangkatan = normalizeDate(tmtPengangkatanVal);
          const cleanTmtTugas = normalizeDate(tmtTugasVal);

          // Category
          const cleanCat = normalizeCategory(kategoriVal, String(jabatanVal || ''));

          // Tingkat kelas inference
          let cleanTingkatKelas: string | undefined = undefined;
          if (cleanCat === 'wali_kelas') {
            if (kelasVal) {
              const kStr = String(kelasVal).trim();
              const numMatch = kStr.match(/\d+/);
              cleanTingkatKelas = numMatch ? `Kelas ${numMatch[0]}` : kStr;
            } else {
              // try to extract from jabatan
              const jMatch = String(jabatanVal || '').match(/kelas\s*(\d+)/i);
              cleanTingkatKelas = jMatch ? `Kelas ${jMatch[1]}` : 'Kelas 1';
            }
          }

          // Mapel inference
          let cleanMapel: string | undefined = undefined;
          if (cleanCat === 'guru_mapel') {
            cleanMapel = mapelVal ? String(mapelVal).trim() : 'Pendidikan Agama Islam & Budi Pekerti';
          }

          // Tendik task inference
          let cleanTendik: string | undefined = undefined;
          if (cleanCat === 'tenaga_kependidikan') {
            cleanTendik = tendikVal ? String(tendikVal).trim() : 'Operator Dapodik & SIM Sekolah';
          }

          // Auto Jabatan
          let cleanJabatan = String(jabatanVal || '').trim();
          if (!cleanJabatan) {
            if (cleanCat === 'kepala_sekolah') cleanJabatan = 'Kepala Sekolah';
            else if (cleanCat === 'wali_kelas') cleanJabatan = `Wali ${cleanTingkatKelas || 'Kelas 1'}`;
            else if (cleanCat === 'guru_mapel') cleanJabatan = `Guru Mapel ${cleanMapel || 'Mata Pelajaran'}`;
            else if (cleanCat === 'tenaga_kependidikan') cleanJabatan = `Tenaga Kependidikan - ${cleanTendik || 'Staf TU'}`;
            else cleanJabatan = 'Guru / Staf';
          }

          // Role
          let cleanRole: UserRole = 'user';
          if (roleVal) {
            const rStr = String(roleVal).trim().toLowerCase();
            if (rStr === 'admin' || rStr === 'administrator') cleanRole = 'admin';
            else if (rStr === 'umum') cleanRole = 'umum';
            else cleanRole = 'user';
          } else {
            // Kepala sekolah and Tendik/Operator default to admin
            if (cleanCat === 'kepala_sekolah' || cleanCat === 'tenaga_kependidikan') {
              cleanRole = 'admin';
            }
          }

          // Status
          let cleanStatus: TeacherActiveStatus = 'Aktif';
          if (statusVal) {
            const sStr = String(statusVal).trim().toLowerCase();
            if (sStr.includes('pensiun')) cleanStatus = 'Pensiun';
            else if (sStr.includes('cuti')) cleanStatus = 'Cuti';
            else if (sStr.includes('mutasi')) cleanStatus = 'Mutasi Keluar';
            else if (sStr.includes('nonaktif') || sStr.includes('berhenti')) cleanStatus = 'Nonaktif';
          }

          // Email
          const cleanEmail = emailVal
            ? String(emailVal).trim()
            : `${rawNama.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'guru'}@sdn006.sch.id`;

          // Random avatar color from list
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

          const teacherData: Partial<AdminUser> = {
            nama: rawNama,
            nip: nipVal && String(nipVal).trim() !== '-' ? String(nipVal).trim() : undefined,
            nuptk: nuptkVal ? String(nuptkVal).trim() : undefined,
            nik: nikVal ? String(nikVal).trim() : undefined,
            jenisKelamin: cleanGender,
            tempatLahir: tempatLahirVal ? String(tempatLahirVal).trim() : undefined,
            tanggalLahir: cleanTglLahir || undefined,
            namaIbuKandung: ibuVal ? String(ibuVal).trim() : undefined,
            statusPernikahan: pernikahanVal ? String(pernikahanVal).trim() : 'Menikah',
            agama: agamaVal ? String(agamaVal).trim() : 'Islam',
            noHp: hpVal ? String(hpVal).trim() : undefined,
            email: cleanEmail,
            alamat: alamatVal ? String(alamatVal).trim() : undefined,
            statusKepegawaian: kepegawaianVal ? String(kepegawaianVal).trim() : 'PNS (Pegawai Negeri Sipil)',
            pangkatGolongan: pangkatVal ? String(pangkatVal).trim() : '- (Non-PNS / Non-Golongan)',
            pendidikanTerakhir: pendidikanVal ? String(pendidikanVal).trim() : 'S1 / Sarjana (D-IV)',
            jurusanPendidikan: prodiVal ? String(prodiVal).trim() : undefined,
            ptAsal: ptVal ? String(ptVal).trim() : undefined,
            tmtPengangkatan: cleanTmtPengangkatan || undefined,
            tmtTugas: cleanTmtTugas || undefined,
            kategoriTugas: cleanCat,
            tingkatKelas: cleanTingkatKelas,
            mataPelajaran: cleanMapel,
            tugasTendik: cleanTendik,
            jabatan: cleanJabatan,
            role: cleanRole,
            status: cleanStatus,
            avatarColor,
          };

          const isValid = errors.length === 0;
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          results.push({
            rowNumber,
            data: teacherData,
            isValid,
            errors,
            warnings,
          });
        });

        resolve({
          totalRows: dataRows.length,
          validRows: validCount,
          invalidRows: invalidCount,
          results,
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Gagal memproses berkas Excel data guru.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca berkas Excel.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
