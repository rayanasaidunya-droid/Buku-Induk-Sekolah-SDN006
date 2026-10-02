import * as XLSX from 'xlsx';
import { Student, Gender, Religion, StudentStatus } from '../types';

export interface ParsedRowResult {
  rowNumber: number;
  data: Partial<Student>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportParseSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  results: ParsedRowResult[];
}

/**
 * 69-Column Standard Template Headers matching Dapodik Kemdikbud Schema (including Kabupaten & Provinsi)
 */
export const TEMPLATE_HEADER_ROW_1 = [
  'No',
  'Nama',
  'NIPD',
  'JK',
  'NISN',
  'Tempat Lahir',
  'Tanggal Lahir',
  'Rombel Saat Ini',
  'NIK',
  'usia',
  'Agama',
  'Alamat',
  'RT',
  'RW',
  'Dusun',
  'Kelurahan',
  'Kecamatan',
  'Kabupaten',
  'Provinsi',
  'Kode Pos',
  'Jenis Tinggal',
  'Alat Transportasi',
  'Telepon',
  'HP',
  'E-Mail',
  'SKHUN',
  'Penerima KPS',
  'No. KPS',
  // Data Ayah (6 cols)
  'Data Ayah', '', '', '', '', '',
  // Data Ibu (6 cols)
  'Data Ibu', '', '', '', '', '',
  // Data Wali (6 cols)
  'Data Wali', '', '', '', '', '',
  'No Peserta Ujian Nasional',
  'No Seri Ijazah',
  'Penerima KIP',
  'Nomor KIP',
  'Nama di KIP',
  'Nomor KKS',
  'No Registrasi Akta Lahir',
  'Bank',
  'Nomor Rekening Bank',
  'Rekening Atas Nama',
  'Layak PIP (usulan dari sekolah)',
  'Alasan Layak PIP',
  'Kebutuhan Khusus',
  'Sekolah Asal',
  'Anak ke-berapa',
  'Lintang',
  'Bujur',
  'No KK',
  'Berat Badan',
  'Tinggi Badan',
  'Lingkar Kepala',
  'Jml. Saudara Kandung',
  'Jarak Rumah ke Sekolah (KM)',
];

export const TEMPLATE_HEADER_ROW_2 = [
  '', '', '', '', '', '', '', '', '', '', // 0-9
  '', '', '', '', '', '', '', '', '', '', // 10-19
  '', '', '', '', '', '', '', '',         // 20-27 (28 single columns before Ayah)
  // Data Ayah sub-columns (28-33)
  'Nama', 'Tahun Lahir', 'Jenjang Pendidikan', 'Pekerjaan', 'Penghasilan', 'NIK',
  // Data Ibu sub-columns (34-39)
  'Nama', 'Tahun Lahir', 'Jenjang Pendidikan', 'Pekerjaan', 'Penghasilan', 'NIK',
  // Data Wali sub-columns (40-45)
  'Nama', 'Tahun Lahir', 'Jenjang Pendidikan', 'Pekerjaan', 'Penghasilan', 'NIK',
  // 46-68 (23 columns)
  '', '', '', '', '', '', '',
  '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '',
];

// Sample demo rows
export const SAMPLE_TEMPLATE_ROW_1 = [
  1,
  'MUHAMMAD RIZKY PRATAMA',
  '2024001',
  'L',
  '0081234567',
  'Jakarta',
  '2011-05-12',
  '7A',
  '3201015205110001',
  13,
  'Islam',
  'Jl. Merdeka No. 45',
  '03',
  '02',
  'Dusun Krajan',
  'Cisalak Pasar',
  'Cimanggis',
  'Kota Depok',
  'Jawa Barat',
  '16452',
  'Bersama Orang Tua',
  'Sepeda Motor',
  '021-8765432',
  '081234567890',
  'rizky.pratama@gmail.com',
  '123456789',
  'Tidak',
  '',
  // Data Ayah (28-33)
  'Budi Santoso',
  '1978',
  'S1',
  'Karyawan Swasta',
  'Rp 4.000.000 - Rp 6.000.000',
  '3201011504780002',
  // Data Ibu (34-39)
  'Siti Rahmawati',
  '1980',
  'S1',
  'Guru / Wiraswasta',
  'Rp 2.000.000 - Rp 3.500.000',
  '3201014808800003',
  // Data Wali (40-45)
  '',
  '',
  '',
  '',
  '',
  '',
  // Modul Ujian, KIP & Lainnya (46-68)
  '01-001-023-4',
  'DN-01/D-SD/13/0012345',
  'Tidak',
  '',
  '',
  '',
  '1234/DIS/2011',
  'BRI',
  '012345678910',
  'MUHAMMAD RIZKY PRATAMA',
  'Tidak',
  '',
  'Tidak Ada',
  'SD Negeri 01 Cimanggis',
  1,
  '-6.3685',
  '106.8456',
  '3201012508100002',
  43,
  152,
  54,
  2,
  1.5,
];

export const SAMPLE_TEMPLATE_ROW_2 = [
  2,
  'AULIA NUR ANGGRAENI',
  '2024002',
  'P',
  '0087654321',
  'Bandung',
  '2011-09-25',
  '7B',
  '3201016509110004',
  13,
  'Islam',
  'Perumahan Griya Asri Blok C2 No. 12',
  '05',
  '08',
  '',
  'Mekarsari',
  'Cimanggis',
  'Kota Depok',
  'Jawa Barat',
  '16452',
  'Bersama Orang Tua',
  'Angkutan Umum',
  '',
  '085712345678',
  'aulia.anggraeni@gmail.com',
  '987654321',
  'Tidak',
  '',
  // Data Ayah (28-33)
  'Drs. Hendra Kusuma',
  '1975',
  'S2',
  'PNS / ASN',
  'Rp 5.000.000 - Rp 8.000.000',
  '3201011203750005',
  // Data Ibu (34-39)
  'Dewi Kartika, S.Pd.',
  '1977',
  'S1',
  'Ibu Rumah Tangga',
  'Tidak Ada',
  '3201015507770006',
  // Data Wali (40-45)
  '',
  '',
  '',
  '',
  '',
  '',
  // Modul Ujian, KIP & Lainnya (46-68)
  '01-001-024-2',
  'DN-01/D-SD/13/0012346',
  'Ya',
  '123456',
  'AULIA NUR ANGGRAENI',
  'KKS-98765',
  '5678/DIS/2011',
  'BRI',
  '098765432100',
  'AULIA NUR ANGGRAENI',
  'Ya',
  'Pemegang KIP / KKS',
  'Tidak Ada',
  'SDIT Nurul Fikri',
  2,
  '-6.3712',
  '106.8521',
  '3201012508100005',
  39,
  148,
  53,
  1,
  2.0,
];

// Backwards-compatible sample object for preview or references
export const SAMPLE_TEMPLATE_ROWS = [
  {
    No: 1,
    Nama: 'MUHAMMAD RIZKY PRATAMA',
    NIPD: '2024001',
    JK: 'L',
    NISN: '0081234567',
    'Tempat Lahir': 'Jakarta',
    'Tanggal Lahir': '2011-05-12',
    'Rombel Saat Ini': '7A',
    NIK: '3201015205110001',
    usia: 13,
    Agama: 'Islam',
    Alamat: 'Jl. Merdeka No. 45',
    RT: '03',
    RW: '02',
    Dusun: 'Dusun Krajan',
    Kelurahan: 'Cisalak Pasar',
    Kecamatan: 'Cimanggis',
    Kabupaten: 'Kota Depok',
    Provinsi: 'Jawa Barat',
    'Kode Pos': '16452',
    'Jenis Tinggal': 'Bersama Orang Tua',
    'Alat Transportasi': 'Sepeda Motor',
    Telepon: '021-8765432',
    HP: '081234567890',
    'E-Mail': 'rizky.pratama@gmail.com',
    SKHUN: '123456789',
    'Penerima KPS': 'Tidak',
    'No. KPS': '',
    'Data Ayah - Nama': 'Budi Santoso',
    'Data Ayah - Tahun Lahir': '1978',
    'Data Ayah - Jenjang Pendidikan': 'S1',
    'Data Ayah - Pekerjaan': 'Karyawan Swasta',
    'Data Ayah - Penghasilan': 'Rp 4.000.000 - Rp 6.000.000',
    'Data Ayah - NIK': '3201011504780002',
    'Data Ibu - Nama': 'Siti Rahmawati',
    'Data Ibu - Tahun Lahir': '1980',
    'Data Ibu - Jenjang Pendidikan': 'S1',
    'Data Ibu - Pekerjaan': 'Guru / Wiraswasta',
    'Data Ibu - Penghasilan': 'Rp 2.000.000 - Rp 3.500.000',
    'Data Ibu - NIK': '3201014808800003',
    'Data Wali - Nama': '',
    'Data Wali - Tahun Lahir': '',
    'Data Wali - Jenjang Pendidikan': '',
    'Data Wali - Pekerjaan': '',
    'Data Wali - Penghasilan': '',
    'Data Wali - NIK': '',
    'No Peserta Ujian Nasional': '01-001-023-4',
    'No Seri Ijazah': 'DN-01/D-SD/13/0012345',
    'Penerima KIP': 'Tidak',
    'Nomor KIP': '',
    'Nama di KIP': '',
    'Nomor KKS': '',
    'No Registrasi Akta Lahir': '1234/DIS/2011',
    Bank: 'BRI',
    'Nomor Rekening Bank': '012345678910',
    'Rekening Atas Nama': 'MUHAMMAD RIZKY PRATAMA',
    'Layak PIP (usulan dari sekolah)': 'Tidak',
    'Alasan Layak PIP': '',
    'Kebutuhan Khusus': 'Tidak Ada',
    'Sekolah Asal': 'SD Negeri 01 Cimanggis',
    'Anak ke-berapa': 1,
    Lintang: '-6.3685',
    Bujur: '106.8456',
    'No KK': '3201012508100002',
    'Berat Badan': 43,
    'Tinggi Badan': 152,
    'Lingkar Kepala': 54,
    'Jml. Saudara Kandung': 2,
    'Jarak Rumah ke Sekolah (KM)': 1.5,
  },
  {
    No: 2,
    Nama: 'AULIA NUR ANGGRAENI',
    NIPD: '2024002',
    JK: 'P',
    NISN: '0087654321',
    'Tempat Lahir': 'Bandung',
    'Tanggal Lahir': '2011-09-25',
    'Rombel Saat Ini': '7B',
    NIK: '3201016509110004',
    usia: 13,
    Agama: 'Islam',
    Alamat: 'Perumahan Griya Asri Blok C2 No. 12',
    RT: '05',
    RW: '08',
    Dusun: '',
    Kelurahan: 'Mekarsari',
    Kecamatan: 'Cimanggis',
    Kabupaten: 'Kota Depok',
    Provinsi: 'Jawa Barat',
    'Kode Pos': '16452',
    'Jenis Tinggal': 'Bersama Orang Tua',
    'Alat Transportasi': 'Angkutan Umum',
    Telepon: '',
    HP: '085712345678',
    'E-Mail': 'aulia.anggraeni@gmail.com',
    SKHUN: '987654321',
    'Penerima KPS': 'Tidak',
    'No. KPS': '',
    'Data Ayah - Nama': 'Drs. Hendra Kusuma',
    'Data Ayah - Tahun Lahir': '1975',
    'Data Ayah - Jenjang Pendidikan': 'S2',
    'Data Ayah - Pekerjaan': 'PNS / ASN',
    'Data Ayah - Penghasilan': 'Rp 5.000.000 - Rp 8.000.000',
    'Data Ayah - NIK': '3201011203750005',
    'Data Ibu - Nama': 'Dewi Kartika, S.Pd.',
    'Data Ibu - Tahun Lahir': '1977',
    'Data Ibu - Jenjang Pendidikan': 'S1',
    'Data Ibu - Pekerjaan': 'Ibu Rumah Tangga',
    'Data Ibu - Penghasilan': 'Tidak Ada',
    'Data Ibu - NIK': '3201015507770006',
    'Data Wali - Nama': '',
    'Data Wali - Tahun Lahir': '',
    'Data Wali - Jenjang Pendidikan': '',
    'Data Wali - Pekerjaan': '',
    'Data Wali - Penghasilan': '',
    'Data Wali - NIK': '',
    'No Peserta Ujian Nasional': '01-001-024-2',
    'No Seri Ijazah': 'DN-01/D-SD/13/0012346',
    'Penerima KIP': 'Ya',
    'Nomor KIP': '123456',
    'Nama di KIP': 'AULIA NUR ANGGRAENI',
    'Nomor KKS': 'KKS-98765',
    'No Registrasi Akta Lahir': '5678/DIS/2011',
    Bank: 'BRI',
    'Nomor Rekening Bank': '098765432100',
    'Rekening Atas Nama': 'AULIA NUR ANGGRAENI',
    'Layak PIP (usulan dari sekolah)': 'Ya',
    'Alasan Layak PIP': 'Pemegang KIP / KKS',
    'Kebutuhan Khusus': 'Tidak Ada',
    'Sekolah Asal': 'SDIT Nurul Fikri',
    'Anak ke-berapa': 2,
    Lintang: '-6.3712',
    Bujur: '106.8521',
    'No KK': '3201012508100005',
    'Berat Badan': 39,
    'Tinggi Badan': 148,
    'Lingkar Kepala': 53,
    'Jml. Saudara Kandung': 1,
    'Jarak Rumah ke Sekolah (KM)': 2.0,
  },
];

// Instructions Sheet Data
export const TEMPLATE_INSTRUCTIONS = [
  { NO: 1, KOLOM: 'Nama', KETERANGAN: 'Nama lengkap peserta didik sesuai Akta Lahir / Ijazah sebelumnya. WAJIB diisi.', CONTOH: 'MUHAMMAD RIZKY PRATAMA' },
  { NO: 2, KOLOM: 'NIPD', KETERANGAN: 'Nomor Induk Peserta Didik (NIS lokal sekolah). Wajib & unik.', CONTOH: '2024001' },
  { NO: 3, KOLOM: 'JK', KETERANGAN: 'Jenis Kelamin: Huruf "L" (Laki-laki) atau "P" (Perempuan). Wajib diisi.', CONTOH: 'L atau P' },
  { NO: 4, KOLOM: 'NISN', KETERANGAN: 'Nomor Induk Siswa Nasional (10 digit angka resmi Kemdikbud).', CONTOH: '0081234567' },
  { NO: 5, KOLOM: 'Tempat Lahir', KETERANGAN: 'Kabupaten/Kota tempat siswa dilahirkan.', CONTOH: 'Jakarta' },
  { NO: 6, KOLOM: 'Tanggal Lahir', KETERANGAN: 'Format tanggal standar: YYYY-MM-DD (contoh: 2011-05-12) atau DD/MM/YYYY.', CONTOH: '2011-05-12' },
  { NO: 7, KOLOM: 'Rombel Saat Ini', KETERANGAN: 'Nama rombongan belajar / kelas saat ini.', CONTOH: '7A / 8B / 1A' },
  { NO: 8, KOLOM: 'NIK', KETERANGAN: 'Nomor Induk Kependudukan siswa (16 digit dari KK/Akta).', CONTOH: '3201015205110001' },
  { NO: 9, KOLOM: 'usia', KETERANGAN: 'Usia peserta didik saat ini (angka tahun).', CONTOH: '13' },
  { NO: 10, KOLOM: 'Agama', KETERANGAN: 'Pilihan: Islam, Kristen Protestan, Katolik, Hindu, Buddha, Konghucu, Lainnya.', CONTOH: 'Islam' },
  { NO: 11, KOLOM: 'Alamat', KETERANGAN: 'Nama jalan, perumahan, atau alamat domisili tempat tinggal siswa.', CONTOH: 'Jl. Merdeka No. 45' },
  { NO: 12, KOLOM: 'RT / RW', KETERANGAN: 'Nomor RT dan Nomor RW domisili siswa.', CONTOH: '03 / 02' },
  { NO: 13, KOLOM: 'Dusun / Kelurahan / Kecamatan', KETERANGAN: 'Wilayah administrasi domisili tempat tinggal siswa.', CONTOH: 'Cisalak Pasar, Cimanggis' },
  { NO: 14, KOLOM: 'Kabupaten & Provinsi', KETERANGAN: 'Nama Kabupaten/Kota dan Provinsi domisili siswa.', CONTOH: 'Kota Depok, Jawa Barat' },
  { NO: 15, KOLOM: 'Kode Pos', KETERANGAN: '5 digit kode pos domisili.', CONTOH: '16452' },
  { NO: 16, KOLOM: 'Jenis Tinggal', KETERANGAN: 'Contoh: Bersama Orang Tua, Wali, Kos, Asrama, Panti Asuhan.', CONTOH: 'Bersama Orang Tua' },
  { NO: 17, KOLOM: 'Alat Transportasi', KETERANGAN: 'Transportasi ke sekolah: Jalan Kaki, Sepeda Motor, Angkutan Umum, Jemputan, dll.', CONTOH: 'Sepeda Motor' },
  { NO: 18, KOLOM: 'Telepon / HP / E-Mail', KETERANGAN: 'Kontak komunikasi aktif peserta didik / orang tua.', CONTOH: '081234567890' },
  { NO: 19, KOLOM: 'SKHUN', KETERANGAN: 'Surat Keterangan Hasil Ujian Nasional jenjang sebelumnya.', CONTOH: '123456789' },
  { NO: 20, KOLOM: 'Penerima KPS / No. KPS', KETERANGAN: 'Status kartu perlindungan sosial: Ya / Tidak dan Nomor KPS jika ada.', CONTOH: 'Tidak' },
  { NO: 21, KOLOM: 'Data Ayah (6 Kolom)', KETERANGAN: 'Meliputi: Nama, Tahun Lahir, Jenjang Pendidikan, Pekerjaan, Penghasilan, NIK Ayah.', CONTOH: 'Budi Santoso, 1978, S1, Karyawan Swasta' },
  { NO: 22, KOLOM: 'Data Ibu (6 Kolom)', KETERANGAN: 'Meliputi: Nama, Tahun Lahir, Jenjang Pendidikan, Pekerjaan, Penghasilan, NIK Ibu.', CONTOH: 'Siti Rahmawati, 1980, S1, Ibu Rumah Tangga' },
  { NO: 23, KOLOM: 'Data Wali (6 Kolom)', KETERANGAN: 'Diisi jika siswa tinggal bersama wali (Nama, Tahun Lahir, Pendidikan, Pekerjaan, Penghasilan, NIK).', CONTOH: 'Opsional' },
  { NO: 24, KOLOM: 'No Peserta Ujian Nasional / No Seri Ijazah', KETERANGAN: 'Nomor peserta ujian & nomor seri ijazah jenjang sebelumnya.', CONTOH: 'DN-01/D-SD/13/0012345' },
  { NO: 25, KOLOM: 'KIP / PIP / KKS', KETERANGAN: 'Data bantuan pendidikan Kemdikbud: Penerima KIP, Nomor KIP, Nama KIP, Nomor KKS, Layak PIP.', CONTOH: 'Ya / 123456' },
  { NO: 26, KOLOM: 'Rekening Bank Siswa', KETERANGAN: 'Nama Bank (contoh: BRI, BNI), Nomor Rekening, dan Rekening Atas Nama siswa.', CONTOH: 'BRI / 012345678910' },
  { NO: 27, KOLOM: 'Sekolah Asal', KETERANGAN: 'Nama sekolah asal (TK/PAUD/SD/MI) sebelum masuk ke sekolah ini.', CONTOH: 'SD Negeri 01 Cimanggis' },
  { NO: 28, KOLOM: 'Fisik Siswa', KETERANGAN: 'Berat Badan (kg), Tinggi Badan (cm), Lingkar Kepala (cm).', CONTOH: 'BB: 43 kg, TB: 152 cm, LK: 54 cm' },
  { NO: 29, KOLOM: 'Jarak ke Sekolah (KM)', KETERANGAN: 'Perkiraan jarak dari rumah ke sekolah dalam satuan kilometer.', CONTOH: '1.5' },
];

/**
 * Generate and download formatted Excel Template (.xlsx) matching exact column order
 */
export const downloadExcelTemplate = (schoolName: string = 'Sekolah') => {
  const wb = XLSX.utils.book_new();

  // Combine rows: Header Row 1, Header Row 2, Sample Row 1, Sample Row 2
  const aoaData = [
    TEMPLATE_HEADER_ROW_1,
    TEMPLATE_HEADER_ROW_2,
    SAMPLE_TEMPLATE_ROW_1,
    SAMPLE_TEMPLATE_ROW_2,
  ];

  const wsData = XLSX.utils.aoa_to_sheet(aoaData);

  // Set Merges:
  // - Columns 0-27: vertically merge row 0 and row 1 (28 columns)
  // - Columns 28-33: horizontally merge row 0 for 'Data Ayah' (6 columns)
  // - Columns 34-39: horizontally merge row 0 for 'Data Ibu' (6 columns)
  // - Columns 40-45: horizontally merge row 0 for 'Data Wali' (6 columns)
  // - Columns 46-68: vertically merge row 0 and row 1 (23 columns)
  const merges: XLSX.Range[] = [
    ...Array.from({ length: 28 }, (_, i) => ({ s: { r: 0, c: i }, e: { r: 1, c: i } })),
    { s: { r: 0, c: 28 }, e: { r: 0, c: 33 } }, // Data Ayah
    { s: { r: 0, c: 34 }, e: { r: 0, c: 39 } }, // Data Ibu
    { s: { r: 0, c: 40 }, e: { r: 0, c: 45 } }, // Data Wali
    ...Array.from({ length: 23 }, (_, i) => ({ s: { r: 0, c: 46 + i }, e: { r: 1, c: 46 + i } })),
  ];
  wsData['!merges'] = merges;

  // Set column widths matching 69 columns
  const colWidths = [
    { wch: 6 },  // 1: No
    { wch: 28 }, // 2: Nama
    { wch: 14 }, // 3: NIPD
    { wch: 6 },  // 4: JK
    { wch: 14 }, // 5: NISN
    { wch: 18 }, // 6: Tempat Lahir
    { wch: 14 }, // 7: Tanggal Lahir
    { wch: 16 }, // 8: Rombel Saat Ini
    { wch: 18 }, // 9: NIK
    { wch: 8 },  // 10: usia
    { wch: 14 }, // 11: Agama
    { wch: 32 }, // 12: Alamat
    { wch: 6 },  // 13: RT
    { wch: 6 },  // 14: RW
    { wch: 16 }, // 15: Dusun
    { wch: 18 }, // 16: Kelurahan
    { wch: 18 }, // 17: Kecamatan
    { wch: 18 }, // 18: Kabupaten
    { wch: 18 }, // 19: Provinsi
    { wch: 10 }, // 20: Kode Pos
    { wch: 18 }, // 21: Jenis Tinggal
    { wch: 18 }, // 22: Alat Transportasi
    { wch: 14 }, // 23: Telepon
    { wch: 16 }, // 24: HP
    { wch: 24 }, // 25: E-Mail
    { wch: 14 }, // 26: SKHUN
    { wch: 14 }, // 27: Penerima KPS
    { wch: 14 }, // 28: No. KPS
    // Data Ayah
    { wch: 22 }, // 29: Nama
    { wch: 12 }, // 30: Tahun Lahir
    { wch: 18 }, // 31: Jenjang Pendidikan
    { wch: 18 }, // 32: Pekerjaan
    { wch: 22 }, // 33: Penghasilan
    { wch: 18 }, // 34: NIK
    // Data Ibu
    { wch: 22 }, // 35: Nama
    { wch: 12 }, // 36: Tahun Lahir
    { wch: 18 }, // 37: Jenjang Pendidikan
    { wch: 18 }, // 38: Pekerjaan
    { wch: 22 }, // 39: Penghasilan
    { wch: 18 }, // 40: NIK
    // Data Wali
    { wch: 22 }, // 41: Nama
    { wch: 12 }, // 42: Tahun Lahir
    { wch: 18 }, // 43: Jenjang Pendidikan
    { wch: 18 }, // 44: Pekerjaan
    { wch: 22 }, // 45: Penghasilan
    { wch: 18 }, // 46: NIK
    // Modul Ujian, KIP & Lainnya
    { wch: 24 }, // 47: No Peserta Ujian Nasional
    { wch: 24 }, // 48: No Seri Ijazah
    { wch: 14 }, // 49: Penerima KIP
    { wch: 16 }, // 50: Nomor KIP
    { wch: 24 }, // 51: Nama di KIP
    { wch: 16 }, // 52: Nomor KKS
    { wch: 24 }, // 53: No Registrasi Akta Lahir
    { wch: 12 }, // 54: Bank
    { wch: 20 }, // 55: Nomor Rekening Bank
    { wch: 24 }, // 56: Rekening Atas Nama
    { wch: 26 }, // 57: Layak PIP (usulan dari sekolah)
    { wch: 22 }, // 58: Alasan Layak PIP
    { wch: 18 }, // 59: Kebutuhan Khusus
    { wch: 24 }, // 60: Sekolah Asal
    { wch: 14 }, // 61: Anak ke-berapa
    { wch: 14 }, // 62: Lintang
    { wch: 14 }, // 63: Bujur
    { wch: 18 }, // 64: No KK
    { wch: 12 }, // 65: Berat Badan
    { wch: 12 }, // 66: Tinggi Badan
    { wch: 14 }, // 67: Lingkar Kepala
    { wch: 20 }, // 68: Jml. Saudara Kandung
    { wch: 24 }, // 69: Jarak Rumah ke Sekolah (KM)
  ];
  wsData['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsData, 'DATA_SISWA');

  // Sheet 2: PETUNJUK_PENGISIAN
  const wsGuide = XLSX.utils.json_to_sheet(TEMPLATE_INSTRUCTIONS);
  wsGuide['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 64 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK_PENGISIAN');

  // File Name
  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `TEMPLATE_IMPORT_BUKU_INDUK_${cleanSchool}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, fileName);
};

/**
 * Export students data into a neat, professionally styled Excel spreadsheet (.xlsx)
 * matching 100% with the official 69-column Dapodik Kemdikbud template.
 */
export const exportStudentsToExcel = (
  students: Student[] = [],
  schoolName: string = 'Sekolah',
  options?: {
    filteredClass?: string;
  }
) => {
  try {
    const list = Array.isArray(students) ? students : [];
    const wb = XLSX.utils.book_new();

    const studentRows = list.map((s, index) => {
    // Calculate approximate age if not explicitly set
    let ageVal: number | string = s.usia || '';
    if (!ageVal && s.tanggalLahir) {
      const birth = new Date(s.tanggalLahir);
      if (!isNaN(birth.getTime())) {
        const diff = Date.now() - birth.getTime();
        ageVal = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    return [
      index + 1, // 1: No
      s.namaLengkap || '', // 2: Nama
      s.noInduk || '', // 3: NIPD (NIS)
      s.jenisKelamin === 'P' ? 'P' : 'L', // 4: JK
      s.nisn || '', // 5: NISN
      s.tempatLahir || '', // 6: Tempat Lahir
      s.tanggalLahir || '', // 7: Tanggal Lahir (YYYY-MM-DD)
      s.kelasSekarang || 'Kelas 1', // 8: Rombel Saat Ini
      s.nik || '', // 9: NIK
      ageVal !== '' ? Number(ageVal) || ageVal : '', // 10: usia
      s.agama || 'Islam', // 11: Agama
      s.alamat || '', // 12: Alamat
      s.rt || '', // 13: RT
      s.rw || '', // 14: RW
      s.dusun || '', // 15: Dusun
      s.kelurahanDesa || '', // 16: Kelurahan
      s.kecamatan || '', // 17: Kecamatan
      s.kabupatenKota || '', // 18: Kabupaten
      s.provinsi || '', // 19: Provinsi
      s.kodePos || '', // 20: Kode Pos
      s.tinggalDengan || 'Bersama Orang Tua', // 21: Jenis Tinggal
      s.transportasi || 'Jalan Kaki', // 22: Alat Transportasi
      s.ayah?.noHp || s.ibu?.noHp || '', // 23: Telepon
      s.noHpSiswa || s.ayah?.noHp || s.ibu?.noHp || '', // 24: HP
      s.emailSiswa || '', // 25: E-Mail
      s.skhun || '', // 26: SKHUN
      s.penerimaKps || 'Tidak', // 27: Penerima KPS
      s.noKps || '', // 28: No. KPS
      // Data Ayah (29-34)
      s.ayah?.nama || '',
      s.ayah?.tahunLahir ? String(s.ayah.tahunLahir) : '',
      s.ayah?.pendidikan || '',
      s.ayah?.pekerjaan || '',
      s.ayah?.penghasilanBulanan || '',
      s.ayah?.nik || '',
      // Data Ibu (35-40)
      s.ibu?.nama || '',
      s.ibu?.tahunLahir ? String(s.ibu.tahunLahir) : '',
      s.ibu?.pendidikan || '',
      s.ibu?.pekerjaan || '',
      s.ibu?.penghasilanBulanan || '',
      s.ibu?.nik || '',
      // Data Wali (41-46)
      s.wali?.nama || '',
      s.wali?.tahunLahir ? String(s.wali.tahunLahir) : '',
      s.wali?.pendidikan || '',
      s.wali?.pekerjaan || '',
      s.wali?.penghasilanBulanan || '',
      s.wali?.nik || '',
      // Modul Ujian, KIP & Lainnya (47-69)
      s.noPesertaUN || '', // 47
      s.noSeriIjazah || s.sttb?.noIjazah || '', // 48
      s.penerimaKip || 'Tidak', // 49
      s.nomorKip || '', // 50
      s.namaDiKip || '', // 51
      s.nomorKks || '', // 52
      s.noRegistrasiAktaLahir || '', // 53
      s.bank || '', // 54
      s.nomorRekeningBank || '', // 55
      s.rekeningAtasNama || '', // 56
      s.layakPip || 'Tidak', // 57
      s.alasanLayakPip || '', // 58
      s.kebutuhanKhusus || 'Tidak Ada', // 59
      s.sekolahAsalTK || '', // 60
      s.anakKe !== undefined && s.anakKe !== null ? Number(s.anakKe) : 1, // 61
      s.lintang || '', // 62
      s.bujur || '', // 63
      s.noKk || '', // 64
      s.kesehatan?.beratBadanKg !== undefined && s.kesehatan?.beratBadanKg !== null ? Number(s.kesehatan.beratBadanKg) : '', // 65
      s.kesehatan?.tinggiBadanCm !== undefined && s.kesehatan?.tinggiBadanCm !== null ? Number(s.kesehatan.tinggiBadanCm) : '', // 66
      s.lingkarKepala !== undefined && s.lingkarKepala !== null ? Number(s.lingkarKepala) : '', // 67
      s.jumlahSaudaraKandung !== undefined && s.jumlahSaudaraKandung !== null ? Number(s.jumlahSaudaraKandung) : 0, // 68
      s.jarakKeSekolahKm !== undefined && s.jarakKeSekolahKm !== null ? Number(s.jarakKeSekolahKm) : 1, // 69
    ];
  });

  const aoaData = [
    TEMPLATE_HEADER_ROW_1,
    TEMPLATE_HEADER_ROW_2,
    ...studentRows,
  ];

  const wsData = XLSX.utils.aoa_to_sheet(aoaData);

  // Set Merges identically to the template:
  const merges: XLSX.Range[] = [
    ...Array.from({ length: 28 }, (_, i) => ({ s: { r: 0, c: i }, e: { r: 1, c: i } })),
    { s: { r: 0, c: 28 }, e: { r: 0, c: 33 } }, // Data Ayah
    { s: { r: 0, c: 34 }, e: { r: 0, c: 39 } }, // Data Ibu
    { s: { r: 0, c: 40 }, e: { r: 0, c: 45 } }, // Data Wali
    ...Array.from({ length: 23 }, (_, i) => ({ s: { r: 0, c: 46 + i }, e: { r: 1, c: 46 + i } })),
  ];
  wsData['!merges'] = merges;

  // Set column widths matching 69 columns
  const colWidths = [
    { wch: 6 },  // 1: No
    { wch: 28 }, // 2: Nama
    { wch: 14 }, // 3: NIPD
    { wch: 6 },  // 4: JK
    { wch: 14 }, // 5: NISN
    { wch: 18 }, // 6: Tempat Lahir
    { wch: 14 }, // 7: Tanggal Lahir
    { wch: 16 }, // 8: Rombel Saat Ini
    { wch: 18 }, // 9: NIK
    { wch: 8 },  // 10: usia
    { wch: 14 }, // 11: Agama
    { wch: 32 }, // 12: Alamat
    { wch: 6 },  // 13: RT
    { wch: 6 },  // 14: RW
    { wch: 16 }, // 15: Dusun
    { wch: 18 }, // 16: Kelurahan
    { wch: 18 }, // 17: Kecamatan
    { wch: 18 }, // 18: Kabupaten
    { wch: 18 }, // 19: Provinsi
    { wch: 10 }, // 20: Kode Pos
    { wch: 18 }, // 21: Jenis Tinggal
    { wch: 18 }, // 22: Alat Transportasi
    { wch: 14 }, // 23: Telepon
    { wch: 16 }, // 24: HP
    { wch: 24 }, // 25: E-Mail
    { wch: 14 }, // 26: SKHUN
    { wch: 14 }, // 27: Penerima KPS
    { wch: 14 }, // 28: No. KPS
    // Data Ayah
    { wch: 22 }, // 29: Nama
    { wch: 12 }, // 30: Tahun Lahir
    { wch: 18 }, // 31: Jenjang Pendidikan
    { wch: 18 }, // 32: Pekerjaan
    { wch: 22 }, // 33: Penghasilan
    { wch: 18 }, // 34: NIK
    // Data Ibu
    { wch: 22 }, // 35: Nama
    { wch: 12 }, // 36: Tahun Lahir
    { wch: 18 }, // 37: Jenjang Pendidikan
    { wch: 18 }, // 38: Pekerjaan
    { wch: 22 }, // 39: Penghasilan
    { wch: 18 }, // 40: NIK
    // Data Wali
    { wch: 22 }, // 41: Nama
    { wch: 12 }, // 42: Tahun Lahir
    { wch: 18 }, // 43: Jenjang Pendidikan
    { wch: 18 }, // 44: Pekerjaan
    { wch: 22 }, // 45: Penghasilan
    { wch: 18 }, // 46: NIK
    // Modul Ujian, KIP & Lainnya
    { wch: 24 }, // 47: No Peserta Ujian Nasional
    { wch: 24 }, // 48: No Seri Ijazah
    { wch: 14 }, // 49: Penerima KIP
    { wch: 16 }, // 50: Nomor KIP
    { wch: 24 }, // 51: Nama di KIP
    { wch: 16 }, // 52: Nomor KKS
    { wch: 24 }, // 53: No Registrasi Akta Lahir
    { wch: 12 }, // 54: Bank
    { wch: 20 }, // 55: Nomor Rekening Bank
    { wch: 24 }, // 56: Rekening Atas Nama
    { wch: 26 }, // 57: Layak PIP (usulan dari sekolah)
    { wch: 22 }, // 58: Alasan Layak PIP
    { wch: 18 }, // 59: Kebutuhan Khusus
    { wch: 24 }, // 60: Sekolah Asal
    { wch: 14 }, // 61: Anak ke-berapa
    { wch: 14 }, // 62: Lintang
    { wch: 14 }, // 63: Bujur
    { wch: 18 }, // 64: No KK
    { wch: 12 }, // 65: Berat Badan
    { wch: 12 }, // 66: Tinggi Badan
    { wch: 14 }, // 67: Lingkar Kepala
    { wch: 20 }, // 68: Jml. Saudara Kandung
    { wch: 24 }, // 69: Jarak Rumah ke Sekolah (KM)
  ];
  wsData['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsData, 'DATA_SISWA');

  // Sheet 2: PETUNJUK_PENGISIAN
  const wsGuide = XLSX.utils.json_to_sheet(TEMPLATE_INSTRUCTIONS);
  wsGuide['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 64 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'PETUNJUK_PENGISIAN');

  // File Name
  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
  const classSuffix = options?.filteredClass && options.filteredClass !== 'Semua' 
    ? `_${options.filteredClass.replace(/[^a-zA-Z0-9]/g, '_')}` 
    : '';
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `DATA_SISWA_BUKU_INDUK_${cleanSchool}${classSuffix}_${dateStr}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error('Gagal mengekspor berkas Excel siswa:', err);
  }
};

/**
 * Format string into standard date YYYY-MM-DD
 */
function normalizeDate(val: any): string {
  if (!val) return '2011-01-01';
  
  if (typeof val === 'number') {
    // Excel date serial number
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return str;
}

/**
 * Standardize religion string
 */
function normalizeReligion(val: any): Religion {
  if (!val) return 'Islam';
  const str = String(val).trim().toLowerCase();
  if (str.includes('kristen') || str.includes('protestan')) return 'Kristen Protestan';
  if (str.includes('katolik')) return 'Katolik';
  if (str.includes('hindu')) return 'Hindu';
  if (str.includes('buddha') || str.includes('budha')) return 'Buddha';
  if (str.includes('konghucu') || str.includes('khonghucu')) return 'Konghucu';
  if (str.includes('lain')) return 'Lainnya';
  return 'Islam';
}

/**
 * Standardize gender string (L/P)
 */
function normalizeGender(val: any): Gender {
  if (!val) return 'L';
  const str = String(val).trim().toUpperCase();
  if (str.startsWith('P') || str.includes('PEREMPUAN') || str.includes('WANITA')) {
    return 'P';
  }
  return 'L';
}

/**
 * Standardize status string
 */
function normalizeStatus(val: any): StudentStatus {
  if (!val) return 'Aktif';
  const str = String(val).trim().toLowerCase();
  if (str.includes('lulus')) return 'Lulus';
  if (str.includes('mutasi') || str.includes('pindah')) return 'Mutasi Keluar';
  if (str.includes('drop') || str.includes('keluar')) return 'Drop Out';
  if (str.includes('meninggal')) return 'Meninggal';
  return 'Aktif';
}

/**
 * Fuzzy getter for row object (handles case variations, spaces, underscores, dots)
 */
function getCol(row: any, ...keys: string[]): any {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return row[k];
    }
  }

  // Case-insensitive lookup
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

/**
 * Parse an Excel or CSV file buffer into structured student records
 * Supports both:
 * 1. 2-Row Header templates (Dapodik 67-column layout with merged group headers)
 * 2. 1-Row Header spreadsheets / CSVs
 */
export async function parseExcelOrCsvFile(file: File): Promise<ImportParseSummary> {
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
          throw new Error('Lembar kerja data tidak ditemukan.');
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

        // Determine if we have a 2-row header (like our official Dapodik template)
        const row0 = (aoa[0] || []).map((v) => String(v || '').trim());
        const row1 = (aoa[1] || []).map((v) => String(v || '').trim());

        const hasSubHeadersInRow1 = row1.some(
          (c) =>
            c.toLowerCase() === 'tahun lahir' ||
            c.toLowerCase() === 'jenjang pendidikan' ||
            c.toLowerCase() === 'pekerjaan' ||
            c.toLowerCase() === 'penghasilan'
        );

        const hasGroupInRow0 = row0.some(
          (c) =>
            c.toLowerCase().includes('data ayah') ||
            c.toLowerCase().includes('data ibu') ||
            c.toLowerCase().includes('data wali')
        );

        const isTwoHeaderRows = hasSubHeadersInRow1 || hasGroupInRow0;

        // Build header column map
        const columnHeaders: string[] = [];
        let currentGroup = '';

        const maxCols = Math.max(row0.length, row1.length);
        for (let c = 0; c < maxCols; c++) {
          const r0Val = row0[c] || '';
          const r1Val = row1[c] || '';

          if (isTwoHeaderRows) {
            if (r0Val.toLowerCase().includes('data ayah')) {
              currentGroup = 'Data Ayah';
            } else if (r0Val.toLowerCase().includes('data ibu')) {
              currentGroup = 'Data Ibu';
            } else if (r0Val.toLowerCase().includes('data wali')) {
              currentGroup = 'Data Wali';
            } else if (r0Val && !r0Val.toLowerCase().includes('data')) {
              currentGroup = '';
            }

            if (currentGroup && r1Val) {
              columnHeaders[c] = `${currentGroup} - ${r1Val}`;
            } else if (r0Val) {
              columnHeaders[c] = r0Val;
            } else if (r1Val) {
              columnHeaders[c] = r1Val;
            } else {
              columnHeaders[c] = `COL_${c}`;
            }
          } else {
            columnHeaders[c] = r0Val || `COL_${c}`;
          }
        }

        const dataStartIndex = isTwoHeaderRows ? 2 : 1;
        const dataRows = aoa.slice(dataStartIndex).filter((r) => r.some((val) => String(val || '').trim() !== ''));

        if (dataRows.length === 0) {
          resolve({
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            results: [],
          });
          return;
        }

        const results: ParsedRowResult[] = [];
        let validCount = 0;
        let invalidCount = 0;

        dataRows.forEach((rowArray, index) => {
          const rowNumber = dataStartIndex + index + 1; // Excel 1-based row number
          const errors: string[] = [];
          const warnings: string[] = [];

          // Build dictionary combining headers and positional fallbacks
          const rowDict: Record<string, any> = {};
          columnHeaders.forEach((header, c) => {
            if (header) {
              rowDict[header] = rowArray[c];
            }
            rowDict[`COL_${c}`] = rowArray[c];
          });

          // Also populate exact column index positions
          if (rowArray.length >= 20) {
            // Determine if row follows the 69-column template (with Kabupaten & Provinsi)
            // or the legacy 67-column template
            const hasKabupatenHeader = columnHeaders.some(h => /kabupaten|kota/i.test(h));
            const isTemplateWithKabProv = hasKabupatenHeader || rowArray.length >= 68;

            if (isTemplateWithKabProv) {
              // 69-Column Schema (Kabupaten at 17, Provinsi at 18)
              if (!rowDict['Nama'] && rowArray[1]) rowDict['Nama'] = rowArray[1];
              if (!rowDict['NIPD'] && rowArray[2]) rowDict['NIPD'] = rowArray[2];
              if (!rowDict['JK'] && rowArray[3]) rowDict['JK'] = rowArray[3];
              if (!rowDict['NISN'] && rowArray[4]) rowDict['NISN'] = rowArray[4];
              if (!rowDict['Tempat Lahir'] && rowArray[5]) rowDict['Tempat Lahir'] = rowArray[5];
              if (!rowDict['Tanggal Lahir'] && rowArray[6]) rowDict['Tanggal Lahir'] = rowArray[6];
              if (!rowDict['Rombel Saat Ini'] && rowArray[7]) rowDict['Rombel Saat Ini'] = rowArray[7];
              if (!rowDict['NIK'] && rowArray[8]) rowDict['NIK'] = rowArray[8];
              if (!rowDict['usia'] && rowArray[9]) rowDict['usia'] = rowArray[9];
              if (!rowDict['Agama'] && rowArray[10]) rowDict['Agama'] = rowArray[10];
              if (!rowDict['Alamat'] && rowArray[11]) rowDict['Alamat'] = rowArray[11];
              if (!rowDict['RT'] && rowArray[12]) rowDict['RT'] = rowArray[12];
              if (!rowDict['RW'] && rowArray[13]) rowDict['RW'] = rowArray[13];
              if (!rowDict['Dusun'] && rowArray[14]) rowDict['Dusun'] = rowArray[14];
              if (!rowDict['Kelurahan'] && rowArray[15]) rowDict['Kelurahan'] = rowArray[15];
              if (!rowDict['Kecamatan'] && rowArray[16]) rowDict['Kecamatan'] = rowArray[16];
              if (!rowDict['Kabupaten'] && rowArray[17]) rowDict['Kabupaten'] = rowArray[17];
              if (!rowDict['Provinsi'] && rowArray[18]) rowDict['Provinsi'] = rowArray[18];
              if (!rowDict['Kode Pos'] && rowArray[19]) rowDict['Kode Pos'] = rowArray[19];
              if (!rowDict['Jenis Tinggal'] && rowArray[20]) rowDict['Jenis Tinggal'] = rowArray[20];
              if (!rowDict['Alat Transportasi'] && rowArray[21]) rowDict['Alat Transportasi'] = rowArray[21];
              if (!rowDict['Telepon'] && rowArray[22]) rowDict['Telepon'] = rowArray[22];
              if (!rowDict['HP'] && rowArray[23]) rowDict['HP'] = rowArray[23];
              if (!rowDict['E-Mail'] && rowArray[24]) rowDict['E-Mail'] = rowArray[24];
              if (!rowDict['SKHUN'] && rowArray[25]) rowDict['SKHUN'] = rowArray[25];
              if (!rowDict['Penerima KPS'] && rowArray[26]) rowDict['Penerima KPS'] = rowArray[26];
              if (!rowDict['No. KPS'] && rowArray[27]) rowDict['No. KPS'] = rowArray[27];

              // Ayah (28-33)
              if (rowArray[28]) rowDict['Data Ayah - Nama'] = rowArray[28];
              if (rowArray[29]) rowDict['Data Ayah - Tahun Lahir'] = rowArray[29];
              if (rowArray[30]) rowDict['Data Ayah - Jenjang Pendidikan'] = rowArray[30];
              if (rowArray[31]) rowDict['Data Ayah - Pekerjaan'] = rowArray[31];
              if (rowArray[32]) rowDict['Data Ayah - Penghasilan'] = rowArray[32];
              if (rowArray[33]) rowDict['Data Ayah - NIK'] = rowArray[33];

              // Ibu (34-39)
              if (rowArray[34]) rowDict['Data Ibu - Nama'] = rowArray[34];
              if (rowArray[35]) rowDict['Data Ibu - Tahun Lahir'] = rowArray[35];
              if (rowArray[36]) rowDict['Data Ibu - Jenjang Pendidikan'] = rowArray[36];
              if (rowArray[37]) rowDict['Data Ibu - Pekerjaan'] = rowArray[37];
              if (rowArray[38]) rowDict['Data Ibu - Penghasilan'] = rowArray[38];
              if (rowArray[39]) rowDict['Data Ibu - NIK'] = rowArray[39];

              // Wali (40-45)
              if (rowArray[40]) rowDict['Data Wali - Nama'] = rowArray[40];
              if (rowArray[41]) rowDict['Data Wali - Tahun Lahir'] = rowArray[41];
              if (rowArray[42]) rowDict['Data Wali - Jenjang Pendidikan'] = rowArray[42];
              if (rowArray[43]) rowDict['Data Wali - Pekerjaan'] = rowArray[43];
              if (rowArray[44]) rowDict['Data Wali - Penghasilan'] = rowArray[44];
              if (rowArray[45]) rowDict['Data Wali - NIK'] = rowArray[45];

              // Modul Lanjutan (46-68)
              if (rowArray[46]) rowDict['No Peserta Ujian Nasional'] = rowArray[46];
              if (rowArray[47]) rowDict['No Seri Ijazah'] = rowArray[47];
              if (rowArray[48]) rowDict['Penerima KIP'] = rowArray[48];
              if (rowArray[49]) rowDict['Nomor KIP'] = rowArray[49];
              if (rowArray[50]) rowDict['Nama di KIP'] = rowArray[50];
              if (rowArray[51]) rowDict['Nomor KKS'] = rowArray[51];
              if (rowArray[52]) rowDict['No Registrasi Akta Lahir'] = rowArray[52];
              if (rowArray[53]) rowDict['Bank'] = rowArray[53];
              if (rowArray[54]) rowDict['Nomor Rekening Bank'] = rowArray[54];
              if (rowArray[55]) rowDict['Rekening Atas Nama'] = rowArray[55];
              if (rowArray[56]) rowDict['Layak PIP (usulan dari sekolah)'] = rowArray[56];
              if (rowArray[57]) rowDict['Alasan Layak PIP'] = rowArray[57];
              if (rowArray[58]) rowDict['Kebutuhan Khusus'] = rowArray[58];
              if (rowArray[59]) rowDict['Sekolah Asal'] = rowArray[59];
              if (rowArray[60]) rowDict['Anak ke-berapa'] = rowArray[60];
              if (rowArray[61]) rowDict['Lintang'] = rowArray[61];
              if (rowArray[62]) rowDict['Bujur'] = rowArray[62];
              if (rowArray[63]) rowDict['No KK'] = rowArray[63];
              if (rowArray[64]) rowDict['Berat Badan'] = rowArray[64];
              if (rowArray[65]) rowDict['Tinggi Badan'] = rowArray[65];
              if (rowArray[66]) rowDict['Lingkar Kepala'] = rowArray[66];
              if (rowArray[67]) rowDict['Jml. Saudara Kandung'] = rowArray[67];
              if (rowArray[68]) rowDict['Jarak Rumah ke Sekolah (KM)'] = rowArray[68];
            } else {
              // Backward-compatible Legacy 67-Column Schema (No Kabupaten/Provinsi columns)
              if (!rowDict['Nama'] && rowArray[1]) rowDict['Nama'] = rowArray[1];
              if (!rowDict['NIPD'] && rowArray[2]) rowDict['NIPD'] = rowArray[2];
              if (!rowDict['JK'] && rowArray[3]) rowDict['JK'] = rowArray[3];
              if (!rowDict['NISN'] && rowArray[4]) rowDict['NISN'] = rowArray[4];
              if (!rowDict['Tempat Lahir'] && rowArray[5]) rowDict['Tempat Lahir'] = rowArray[5];
              if (!rowDict['Tanggal Lahir'] && rowArray[6]) rowDict['Tanggal Lahir'] = rowArray[6];
              if (!rowDict['Rombel Saat Ini'] && rowArray[7]) rowDict['Rombel Saat Ini'] = rowArray[7];
              if (!rowDict['NIK'] && rowArray[8]) rowDict['NIK'] = rowArray[8];
              if (!rowDict['usia'] && rowArray[9]) rowDict['usia'] = rowArray[9];
              if (!rowDict['Agama'] && rowArray[10]) rowDict['Agama'] = rowArray[10];
              if (!rowDict['Alamat'] && rowArray[11]) rowDict['Alamat'] = rowArray[11];
              if (!rowDict['RT'] && rowArray[12]) rowDict['RT'] = rowArray[12];
              if (!rowDict['RW'] && rowArray[13]) rowDict['RW'] = rowArray[13];
              if (!rowDict['Dusun'] && rowArray[14]) rowDict['Dusun'] = rowArray[14];
              if (!rowDict['Kelurahan'] && rowArray[15]) rowDict['Kelurahan'] = rowArray[15];
              if (!rowDict['Kecamatan'] && rowArray[16]) rowDict['Kecamatan'] = rowArray[16];
              if (!rowDict['Kode Pos'] && rowArray[17]) rowDict['Kode Pos'] = rowArray[17];
              if (!rowDict['Jenis Tinggal'] && rowArray[18]) rowDict['Jenis Tinggal'] = rowArray[18];
              if (!rowDict['Alat Transportasi'] && rowArray[19]) rowDict['Alat Transportasi'] = rowArray[19];
              if (!rowDict['Telepon'] && rowArray[20]) rowDict['Telepon'] = rowArray[20];
              if (!rowDict['HP'] && rowArray[21]) rowDict['HP'] = rowArray[21];
              if (!rowDict['E-Mail'] && rowArray[22]) rowDict['E-Mail'] = rowArray[22];
              if (!rowDict['SKHUN'] && rowArray[23]) rowDict['SKHUN'] = rowArray[23];
              if (!rowDict['Penerima KPS'] && rowArray[24]) rowDict['Penerima KPS'] = rowArray[24];
              if (!rowDict['No. KPS'] && rowArray[25]) rowDict['No. KPS'] = rowArray[25];

              // Ayah
              if (rowArray[26]) rowDict['Data Ayah - Nama'] = rowArray[26];
              if (rowArray[27]) rowDict['Data Ayah - Tahun Lahir'] = rowArray[27];
              if (rowArray[28]) rowDict['Data Ayah - Jenjang Pendidikan'] = rowArray[28];
              if (rowArray[29]) rowDict['Data Ayah - Pekerjaan'] = rowArray[29];
              if (rowArray[30]) rowDict['Data Ayah - Penghasilan'] = rowArray[30];
              if (rowArray[31]) rowDict['Data Ayah - NIK'] = rowArray[31];

              // Ibu
              if (rowArray[32]) rowDict['Data Ibu - Nama'] = rowArray[32];
              if (rowArray[33]) rowDict['Data Ibu - Tahun Lahir'] = rowArray[33];
              if (rowArray[34]) rowDict['Data Ibu - Jenjang Pendidikan'] = rowArray[34];
              if (rowArray[35]) rowDict['Data Ibu - Pekerjaan'] = rowArray[35];
              if (rowArray[36]) rowDict['Data Ibu - Penghasilan'] = rowArray[36];
              if (rowArray[37]) rowDict['Data Ibu - NIK'] = rowArray[37];

              // Wali
              if (rowArray[38]) rowDict['Data Wali - Nama'] = rowArray[38];
              if (rowArray[39]) rowDict['Data Wali - Tahun Lahir'] = rowArray[39];
              if (rowArray[40]) rowDict['Data Wali - Jenjang Pendidikan'] = rowArray[40];
              if (rowArray[41]) rowDict['Data Wali - Pekerjaan'] = rowArray[41];
              if (rowArray[42]) rowDict['Data Wali - Penghasilan'] = rowArray[42];
              if (rowArray[43]) rowDict['Data Wali - NIK'] = rowArray[43];

              // Modul Lanjutan
              if (rowArray[44]) rowDict['No Peserta Ujian Nasional'] = rowArray[44];
              if (rowArray[45]) rowDict['No Seri Ijazah'] = rowArray[45];
              if (rowArray[46]) rowDict['Penerima KIP'] = rowArray[46];
              if (rowArray[47]) rowDict['Nomor KIP'] = rowArray[47];
              if (rowArray[48]) rowDict['Nama di KIP'] = rowArray[48];
              if (rowArray[49]) rowDict['Nomor KKS'] = rowArray[49];
              if (rowArray[50]) rowDict['No Registrasi Akta Lahir'] = rowArray[50];
              if (rowArray[51]) rowDict['Bank'] = rowArray[51];
              if (rowArray[52]) rowDict['Nomor Rekening Bank'] = rowArray[52];
              if (rowArray[53]) rowDict['Rekening Atas Nama'] = rowArray[53];
              if (rowArray[54]) rowDict['Layak PIP (usulan dari sekolah)'] = rowArray[54];
              if (rowArray[55]) rowDict['Alasan Layak PIP'] = rowArray[55];
              if (rowArray[56]) rowDict['Kebutuhan Khusus'] = rowArray[56];
              if (rowArray[57]) rowDict['Sekolah Asal'] = rowArray[57];
              if (rowArray[58]) rowDict['Anak ke-berapa'] = rowArray[58];
              if (rowArray[59]) rowDict['Lintang'] = rowArray[59];
              if (rowArray[60]) rowDict['Bujur'] = rowArray[60];
              if (rowArray[61]) rowDict['No KK'] = rowArray[61];
              if (rowArray[62]) rowDict['Berat Badan'] = rowArray[62];
              if (rowArray[63]) rowDict['Tinggi Badan'] = rowArray[63];
              if (rowArray[64]) rowDict['Lingkar Kepala'] = rowArray[64];
              if (rowArray[65]) rowDict['Jml. Saudara Kandung'] = rowArray[65];
              if (rowArray[66]) rowDict['Jarak Rumah ke Sekolah (KM)'] = rowArray[66];
            }
          }

          // Extract attributes with rich synonym getters
          const namaLengkap = getCol(rowDict, 'Nama', 'NAMA', 'NAMA_LENGKAP', 'NAMA LENGKAP', 'Nama Siswa', 'Nama Peserta Didik');
          const noInduk = getCol(rowDict, 'NIPD', 'NO_INDUK', 'NIS', 'NO INDUK', 'NOMOR INDUK', 'No Induk');
          const nisn = getCol(rowDict, 'NISN', 'NISN_SISWA', 'NOMOR_NISN');

          if (!namaLengkap) {
            errors.push('Kolom Nama Lengkap wajib diisi.');
          }

          if (!noInduk && !nisn) {
            warnings.push('Nomor Induk (NIPD) / NISN kosong, sistem akan menghasilkan No Induk otomatis.');
          }

          const rawGender = getCol(rowDict, 'JK', 'JENIS_KELAMIN', 'JENIS KELAMIN', 'GENDER', 'L_P');
          const jenisKelamin = normalizeGender(rawGender);

          const rawReligion = getCol(rowDict, 'Agama', 'AGAMA', 'AGAMA_SISWA');
          const agama = normalizeReligion(rawReligion);

          const rawStatus = getCol(rowDict, 'Status', 'STATUS_SISWA', 'STATUS');
          const status = normalizeStatus(rawStatus);

          const studentData: Partial<Student> = {
            noInduk: noInduk ? String(noInduk).trim() : '',
            nisn: nisn ? String(nisn).trim() : '',
            nik: String(getCol(rowDict, 'NIK', 'NIK_SISWA') || '').trim(),
            noKk: String(getCol(rowDict, 'No KK', 'NO_KK', 'KK') || '').trim(),
            namaLengkap: String(namaLengkap || '').trim().toUpperCase(),
            namaPanggilan: String(getCol(rowDict, 'Nama Panggilan', 'NAMA_PANGGILAN', 'PANGGILAN') || '').trim(),
            jenisKelamin,
            tempatLahir: String(getCol(rowDict, 'Tempat Lahir', 'TEMPAT_LAHIR', 'TMP_LAHIR') || 'Depok').trim(),
            tanggalLahir: normalizeDate(getCol(rowDict, 'Tanggal Lahir', 'TANGGAL_LAHIR', 'TGL_LAHIR')),
            agama,
            kewarganegaraan: String(getCol(rowDict, 'Kewarganegaraan', 'KEWARGANEGARAAN', 'WARGA_NEGARA') || 'WNI').trim(),
            anakKe: Number(getCol(rowDict, 'Anak ke-berapa', 'ANAK_KE', 'ANAK KE') || 1),
            jumlahSaudaraKandung: Number(getCol(rowDict, 'Jml. Saudara Kandung', 'JUMLAH_SAUDARA_KANDUNG', 'SAUDARA_KANDUNG', 'JML_SAUDARA') || 1),
            jumlahSaudaraTiri: Number(getCol(rowDict, 'JUMLAH_SAUDARA_TIRI') || 0),
            jumlahSaudaraAngkat: Number(getCol(rowDict, 'JUMLAH_SAUDARA_ANGKAT') || 0),
            statusKeluarga: (getCol(rowDict, 'STATUS_KELUARGA') || 'Anak Kandung') as any,
            bahasaIbu: String(getCol(rowDict, 'BAHASA_IBU', 'BAHASA') || 'Bahasa Indonesia').trim(),

            // Alamat & Domisili
            alamat: String(getCol(rowDict, 'Alamat', 'ALAMAT_JALAN', 'ALAMAT', 'ALAMAT_RUMAH') || 'Jl. Raya Pendidikan').trim(),
            rt: String(getCol(rowDict, 'RT') || '01').trim(),
            rw: String(getCol(rowDict, 'RW') || '01').trim(),
            dusun: String(getCol(rowDict, 'Dusun', 'DUSUN') || '').trim(),
            kelurahanDesa: String(getCol(rowDict, 'Kelurahan', 'KELURAHAN_DESA', 'DESA') || '').trim(),
            kecamatan: String(getCol(rowDict, 'Kecamatan', 'KECAMATAN') || '').trim(),
            kabupatenKota: String(getCol(rowDict, 'Kabupaten', 'Kabupaten/Kota', 'KABUPATEN', 'KOTA', 'KABUPATEN_KOTA', 'Kabupaten / Kota', 'KAB') || '').trim(),
            provinsi: String(getCol(rowDict, 'Provinsi', 'PROVINSI', 'PROP', 'Propinsi', 'PROPINSI') || '').trim(),
            kodePos: String(getCol(rowDict, 'Kode Pos', 'KODE_POS', 'KODEPOS') || '').trim(),
            tinggalDengan: (getCol(rowDict, 'Jenis Tinggal', 'TINGGAL_DENGAN', 'TINGGAL_BERSAMA') || 'Orang Tua') as any,
            jarakKeSekolahKm: Number(getCol(rowDict, 'Jarak Rumah ke Sekolah (KM)', 'JARAK_KE_SEKOLAH_KM', 'JARAK_KM') || 1),
            transportasi: (getCol(rowDict, 'Alat Transportasi', 'TRANSPORTASI') || 'Jalan Kaki') as any,
            noHpSiswa: String(getCol(rowDict, 'HP', 'NO_HP_SISWA', 'HP_SISWA') || '').trim(),
            emailSiswa: String(getCol(rowDict, 'E-Mail', 'EMAIL_SISWA', 'EMAIL') || '').trim(),

            // Dapodik Extended Fields
            usia: getCol(rowDict, 'usia', 'USIA', 'UMUR'),
            skhun: String(getCol(rowDict, 'SKHUN', 'NO SKHUN') || '').trim(),
            penerimaKps: String(getCol(rowDict, 'Penerima KPS', 'PENERIMA_KPS') || 'Tidak').trim(),
            noKps: String(getCol(rowDict, 'No. KPS', 'NO_KPS') || '').trim(),
            noPesertaUN: String(getCol(rowDict, 'No Peserta Ujian Nasional', 'NO_PESERTA_UN') || '').trim(),
            noSeriIjazah: String(getCol(rowDict, 'No Seri Ijazah', 'NO_SERI_IJAZAH') || '').trim(),
            penerimaKip: String(getCol(rowDict, 'Penerima KIP', 'PENERIMA_KIP') || 'Tidak').trim(),
            nomorKip: String(getCol(rowDict, 'Nomor KIP', 'NOMOR_KIP') || '').trim(),
            namaDiKip: String(getCol(rowDict, 'Nama di KIP', 'NAMA_DI_KIP') || '').trim(),
            nomorKks: String(getCol(rowDict, 'Nomor KKS', 'NOMOR_KKS') || '').trim(),
            noRegistrasiAktaLahir: String(getCol(rowDict, 'No Registrasi Akta Lahir', 'NO_REGISTRASI_AKTA_LAHIR', 'AKTA_LAHIR') || '').trim(),
            bank: String(getCol(rowDict, 'Bank', 'BANK') || '').trim(),
            nomorRekeningBank: String(getCol(rowDict, 'Nomor Rekening Bank', 'NOMOR_REKENING_BANK', 'NO_REKENING') || '').trim(),
            rekeningAtasNama: String(getCol(rowDict, 'Rekening Atas Nama', 'REKENING_ATAS_NAMA') || '').trim(),
            layakPip: String(getCol(rowDict, 'Layak PIP (usulan dari sekolah)', 'LAYAK_PIP') || 'Tidak').trim(),
            alasanLayakPip: String(getCol(rowDict, 'Alasan Layak PIP', 'ALASAN_LAYAK_PIP') || '').trim(),
            kebutuhanKhusus: String(getCol(rowDict, 'Kebutuhan Khusus', 'KEBUTUHAN_KHUSUS') || 'Tidak Ada').trim(),
            lintang: String(getCol(rowDict, 'Lintang', 'LATITUDE') || '').trim(),
            bujur: String(getCol(rowDict, 'Bujur', 'LONGITUDE') || '').trim(),
            lingkarKepala: Number(getCol(rowDict, 'Lingkar Kepala', 'LINGKAR_KEPALA') || 0) || undefined,

            // Kesehatan & Jasmani
            kesehatan: {
              golonganDarah: (getCol(rowDict, 'Golongan Darah', 'GOLONGAN_DARAH', 'GOL_DARAH') || 'Tidak Tahu') as any,
              penyakitPernahDiderita: String(getCol(rowDict, 'Penyakit Pernah Diderita', 'PENYAKIT_DIDERITA') || 'Tidak Ada').trim(),
              kelainanJasmani: String(getCol(rowDict, 'Kelainan Jasmani', 'KELAINAN_JASMANI') || 'Tidak Ada').trim(),
              tinggiBadanCm: Number(getCol(rowDict, 'Tinggi Badan', 'TINGGI_BADAN_CM', 'TINGGI_BADAN') || 150),
              beratBadanKg: Number(getCol(rowDict, 'Berat Badan', 'BERAT_BADAN_KG', 'BERAT_BADAN') || 40),
            },

            // Data Ayah
            ayah: {
              nama: String(getCol(rowDict, 'Data Ayah - Nama', 'AYAH_NAMA', 'NAMA_AYAH', 'AYAH') || '-').trim(),
              nik: String(getCol(rowDict, 'Data Ayah - NIK', 'AYAH_NIK', 'NIK_AYAH') || '').trim(),
              tahunLahir: getCol(rowDict, 'Data Ayah - Tahun Lahir', 'AYAH_TAHUN_LAHIR', 'TAHUN_LAHIR_AYAH'),
              agama: normalizeReligion(getCol(rowDict, 'AGAMA_AYAH')),
              kewarganegaraan: 'WNI',
              pendidikan: String(getCol(rowDict, 'Data Ayah - Jenjang Pendidikan', 'AYAH_JENJANG_PENDIDIKAN', 'PENDIDIKAN_AYAH') || 'SMA').trim(),
              pekerjaan: String(getCol(rowDict, 'Data Ayah - Pekerjaan', 'AYAH_PEKERJAAN', 'PEKERJAAN_AYAH') || 'Wiraswasta').trim(),
              penghasilanBulanan: String(getCol(rowDict, 'Data Ayah - Penghasilan', 'AYAH_PENGHASILAN', 'PENGHASILAN_AYAH') || 'Rp 3.000.000 - Rp 5.000.000').trim(),
              noHp: String(getCol(rowDict, 'NO_HP_AYAH', 'HP_AYAH') || '').trim(),
              statusHidup: (getCol(rowDict, 'STATUS_HIDUP_AYAH') || 'Masih Hidup') as any,
            },

            // Data Ibu
            ibu: {
              nama: String(getCol(rowDict, 'Data Ibu - Nama', 'IBU_NAMA', 'NAMA_IBU', 'IBU') || '-').trim(),
              nik: String(getCol(rowDict, 'Data Ibu - NIK', 'IBU_NIK', 'NIK_IBU') || '').trim(),
              tahunLahir: getCol(rowDict, 'Data Ibu - Tahun Lahir', 'IBU_TAHUN_LAHIR', 'TAHUN_LAHIR_IBU'),
              agama: normalizeReligion(getCol(rowDict, 'AGAMA_IBU')),
              kewarganegaraan: 'WNI',
              pendidikan: String(getCol(rowDict, 'Data Ibu - Jenjang Pendidikan', 'IBU_JENJANG_PENDIDIKAN', 'PENDIDIKAN_IBU') || 'SMA').trim(),
              pekerjaan: String(getCol(rowDict, 'Data Ibu - Pekerjaan', 'IBU_PEKERJAAN', 'PEKERJAAN_IBU') || 'Ibu Rumah Tangga').trim(),
              penghasilanBulanan: String(getCol(rowDict, 'Data Ibu - Penghasilan', 'IBU_PENGHASILAN', 'PENGHASILAN_IBU') || 'Tidak Ada').trim(),
              noHp: String(getCol(rowDict, 'NO_HP_IBU', 'HP_IBU') || '').trim(),
              statusHidup: (getCol(rowDict, 'STATUS_HIDUP_IBU') || 'Masih Hidup') as any,
            },

            // Data Wali
            wali: getCol(rowDict, 'Data Wali - Nama', 'NAMA_WALI', 'WALI') ? {
              nama: String(getCol(rowDict, 'Data Wali - Nama', 'NAMA_WALI', 'WALI')).trim(),
              nik: String(getCol(rowDict, 'Data Wali - NIK', 'NIK_WALI') || '').trim(),
              tahunLahir: getCol(rowDict, 'Data Wali - Tahun Lahir', 'WALI_TAHUN_LAHIR'),
              hubungan: String(getCol(rowDict, 'HUBUNGAN_WALI') || 'Wali').trim(),
              pendidikan: String(getCol(rowDict, 'Data Wali - Jenjang Pendidikan', 'PENDIDIKAN_WALI') || '').trim(),
              pekerjaan: String(getCol(rowDict, 'Data Wali - Pekerjaan', 'PEKERJAAN_WALI') || '').trim(),
              penghasilanBulanan: String(getCol(rowDict, 'Data Wali - Penghasilan', 'PENGHASILAN_WALI') || '').trim(),
              noHp: String(getCol(rowDict, 'NO_HP_WALI') || '').trim(),
            } : undefined,

            // Riwayat Masuk & Rombel
            sekolahAsalTK: String(getCol(rowDict, 'Sekolah Asal', 'ASAL_SEKOLAH_TK_SD', 'ASAL_SEKOLAH', 'SEKOLAH_ASAL') || '-').trim(),
            noIjazahTK: String(getCol(rowDict, 'No Seri Ijazah', 'NO_IJAZAH_SEBELUMNYA', 'NO_IJAZAH_ASAL') || '').trim(),
            tanggalDiterima: normalizeDate(getCol(rowDict, 'TANGGAL_DITERIMA', 'TGL_DITERIMA')),
            diterimaDiKelas: String(getCol(rowDict, 'DITERIMA_DI_KELAS') || '7').trim(),
            kelasSekarang: String(getCol(rowDict, 'Rombel Saat Ini', 'KELAS_SEKARANG', 'KELAS', 'ROMBEL') || '7A').trim(),
            status,
            tahunMasuk: String(getCol(rowDict, 'TAHUN_MASUK') || new Date().getFullYear().toString()).trim(),
            raport: [],
          };

          const isValid = errors.length === 0;
          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }

          results.push({
            rowNumber,
            data: studentData,
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
        reject(new Error(err?.message || 'Gagal membaca berkas Excel / CSV.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file berkas.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
