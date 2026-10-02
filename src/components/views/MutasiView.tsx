import React, { useState } from 'react';
import { UserMinus, Plus, Printer, Search, FileText, ArrowLeft, Building, AlertCircle, RotateCcw, CheckCircle, Eye, AlertTriangle, X, ShieldAlert, Edit3 } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import { formatIndonesianDate, cn } from '../../lib/utils';
import { KopSuratHeader } from '../layout/KopSuratHeader';

interface MutasiViewProps {
  onOpenMutationModal: (student: Student) => void;
  onSelectStudentDetail: (studentId: string) => void;
  onBack?: () => void;
  setActiveTab?: (tab: any) => void;
}

export const MutasiView: React.FC<MutasiViewProps> = ({
  onOpenMutationModal,
  onSelectStudentDetail,
  onBack,
  setActiveTab,
}) => {
  const { students, schoolProfile, currentRole, cancelMutation, rolePermissions } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForLetter, setSelectedStudentForLetter] = useState<Student | null>(null);
  const [isPrintingRekap, setIsPrintingRekap] = useState(false);
  const [studentToCancelMutation, setStudentToCancelMutation] = useState<Student | null>(null);
  const [restoreClass, setRestoreClass] = useState<string>('Kelas 1');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Students who have mutasi records
  const mutatedStudents = students.filter(s => s.mutasi || s.status === 'Mutasi Keluar');
  const activeStudents = students.filter(s => s.status === 'Aktif');

  const filteredMutated = mutatedStudents.filter(s => 
    s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.noInduk.includes(searchTerm) ||
    s.mutasi?.sekolahTujuan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageMutation = currentRole !== 'umum' && (rolePermissions?.inputMutasi !== false);

  const handlePrintLetter = (student: Student) => {
    setIsPrintingRekap(false);
    setSelectedStudentForLetter(student);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintRekapMutasi = () => {
    setSelectedStudentForLetter(null);
    setIsPrintingRekap(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleOpenCancelDialog = (student: Student) => {
    setStudentToCancelMutation(student);
    setRestoreClass(student.mutasi?.dariKelas || student.kelasSekarang || 'Kelas 1');
  };

  const handleConfirmCancelMutation = () => {
    if (!studentToCancelMutation) return;

    const studentName = studentToCancelMutation.namaLengkap;
    const targetClass = restoreClass || studentToCancelMutation.mutasi?.dariKelas || studentToCancelMutation.kelasSekarang || 'Kelas 1';
    
    cancelMutation(studentToCancelMutation.id, targetClass);
    setStudentToCancelMutation(null);

    setFeedbackToast({
      message: `Mutasi siswa ${studentName} berhasil dibatalkan. Status siswa kini AKTIF kembali di ${targetClass}.`,
      type: 'success',
    });

    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (setActiveTab) {
      setActiveTab('dashboard');
    }
  };

  const classOptions = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6', 'Kelas 7', 'Kelas 8', 'Kelas 9', 'Kelas 10', 'Kelas 11', 'Kelas 12'];

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="no-print fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-700 text-white rounded-xl shadow-xl border border-emerald-600 text-xs font-semibold max-w-md">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span className="flex-1">{feedbackToast.message}</span>
            <button
              onClick={() => setFeedbackToast(null)}
              className="p-1 hover:bg-emerald-800 rounded-md text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft className="w-4 h-4 text-[#003399] dark:text-blue-400" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Buku Mutasi & Siswa Meninggalkan Sekolah
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 font-extrabold text-xs">
                Sheet TINGGALKAN ({mutatedStudents.length})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Register resmi pencatatan peserta didik yang pindah atau meninggalkan sekolah
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintRekapMutasi}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003399] hover:bg-[#002266] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Cetak Laporan Rekapitulasi Mutasi & Siswa Pindah (Sheet TINGGALKAN)"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Mutasi</span>
          </button>

          {currentRole !== 'umum' && (
            <select
              onChange={(e) => {
                const s = students.find(item => item.id === e.target.value);
                if (s) onOpenMutationModal(s);
              }}
              defaultValue=""
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="" disabled>+ Pilih Siswa untuk Dipindahkan...</option>
              {activeStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.noInduk} - {s.namaLengkap} ({s.kelasSekarang})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa mutasi atau sekolah tujuan..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-orange-800 dark:text-orange-300">Total Mutasi Keluar</div>
            <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{mutatedStudents.length} Siswa</div>
          </div>
          <UserMinus className="w-8 h-8 text-orange-400 opacity-60" />
        </div>
      </div>

      {/* Table of Mutations */}
      <div className="no-print rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#002266] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">NIS / NISN</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Tgl Meninggalkan</th>
                <th className="p-3">Dari Kelas</th>
                <th className="p-3">Sekolah Tujuan</th>
                <th className="p-3">Alasan Pindah</th>
                <th className="p-3 text-right">Aksi & Surat Mutasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMutated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Belum ada siswa dalam register mutasi keluar.
                  </td>
                </tr>
              ) : (
                filteredMutated.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-300">
                      {student.noInduk}
                      <div className="text-[10px] text-slate-400">{student.nisn}</div>
                    </td>
                    <td className="p-3">
                      <div 
                        onClick={() => onSelectStudentDetail(student.id)}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer"
                      >
                        {student.namaLengkap}
                      </div>
                      <div className="text-[10px] text-slate-400">{student.tempatLahir}, {formatIndonesianDate(student.tanggalLahir)}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {student.mutasi ? formatIndonesianDate(student.mutasi.tglMeninggalkan) : '-'}
                    </td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                      {student.mutasi?.dariKelas || student.kelasSekarang}
                    </td>
                    <td className="p-3 font-bold text-blue-900 dark:text-blue-300">
                      {student.mutasi?.sekolahTujuan || '-'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {student.mutasi?.alasanPindah || '-'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Edit Mutasi */}
                        {canManageMutation && (
                          <button
                            onClick={() => onOpenMutationModal(student)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            title="Edit data dan catatan mutasi siswa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Mutasi</span>
                          </button>
                        )}

                        {/* Tombol Cetak Surat Pindah */}
                        <button
                          onClick={() => handlePrintLetter(student)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                          title="Cetak Surat Keterangan Pindah Sekolah"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Surat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL: BATALKAN MUTASI */}
      {studentToCancelMutation && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-5 py-4 bg-rose-600 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide">
                    KONFIRMASI PEMBATALAN MUTASI
                  </h3>
                  <p className="text-[11px] text-rose-100">
                    Pengembalian Status Siswa ke Buku Induk Aktif
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStudentToCancelMutation(null)}
                className="p-1 rounded-md text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-5 space-y-4 text-xs">
              {/* Alert Notice */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="font-bold text-amber-900 dark:text-amber-200">Perhatian:</p>
                  Tindakan ini akan <strong>menghapus catatan mutasi keluar</strong> dari lembar Sheet TINGGALKAN dan mengembalikan status peserta didik menjadi <strong>AKTIF</strong> di Buku Induk Siswa.
                </div>
              </div>

              {/* Student Summary Info */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Nama Siswa:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{studentToCancelMutation.namaLengkap}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nomor Induk (NIS):</span>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{studentToCancelMutation.noInduk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">NISN:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{studentToCancelMutation.nisn}</span>
                </div>
                {studentToCancelMutation.mutasi?.sekolahTujuan && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sekolah Tujuan Semula:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">{studentToCancelMutation.mutasi.sekolahTujuan}</span>
                  </div>
                )}
                {studentToCancelMutation.mutasi?.tglMeninggalkan && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tanggal Pencatatan Mutasi:</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatIndonesianDate(studentToCancelMutation.mutasi.tglMeninggalkan)}</span>
                  </div>
                )}
              </div>

              {/* Restore Class Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kembalikan ke Kelas Aktif: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={restoreClass}
                  onChange={(e) => setRestoreClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
                >
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilih tingkat kelas aktif saat siswa kembali mengikuti kegiatan belajar.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStudentToCancelMutation(null)}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelMutation}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ya, Batalkan Mutasi & Aktifkan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMAL SURAT KETERANGAN PINDAH SEKOLAH (Printed when Cetak Surat clicked) */}
      {selectedStudentForLetter && !isPrintingRekap && (
        <div className="max-w-[210mm] mx-auto bg-white text-slate-950 p-[15mm] shadow-2xl rounded-sm font-serif text-[12px] leading-relaxed border border-slate-300 print:border-none print:shadow-none print:m-0 print:w-full">
          {/* Kop Surat Resmi dengan Logo Kiri & Logo Kanan */}
          <KopSuratHeader
            schoolProfile={schoolProfile}
            documentTitle="SURAT KETERANGAN PINDAH SEKOLAH"
            documentSubtitle={`Nomor: ${selectedStudentForLetter.mutasi?.noSuratPindah || `421.2/SDN-006/KP/${new Date().getFullYear()}/042`}`}
          />

          <p className="indent-8 text-justify mb-4">
            Yang bertanda tangan di bawah ini Kepala {schoolProfile.namaSekolah}, Kecamatan {schoolProfile.kecamatan}, Kabupaten {schoolProfile.kabupatenKota}, Provinsi {schoolProfile.provinsi}, menerangkan bahwa:
          </p>

          <table className="w-full border-collapse text-[12px] ml-4 mb-4">
            <tbody>
              <tr><td className="w-48 py-1">Nama Lengkap</td><td className="w-3">:</td><td className="font-bold uppercase">{selectedStudentForLetter.namaLengkap}</td></tr>
              <tr><td className="py-1">Nomor Induk Siswa (NIS)</td><td>:</td><td className="font-mono font-bold">{selectedStudentForLetter.noInduk}</td></tr>
              <tr><td className="py-1">NISN</td><td>:</td><td className="font-mono font-bold">{selectedStudentForLetter.nisn}</td></tr>
              <tr><td className="py-1">Jenis Kelamin</td><td>:</td><td>{selectedStudentForLetter.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td></tr>
              <tr><td className="py-1">Tempat, Tanggal Lahir</td><td>:</td><td>{selectedStudentForLetter.tempatLahir}, {formatIndonesianDate(selectedStudentForLetter.tanggalLahir)}</td></tr>
              <tr><td className="py-1">Tingkat Kelas Terakhir</td><td>:</td><td className="font-bold">{selectedStudentForLetter.mutasi?.dariKelas || selectedStudentForLetter.kelasSekarang}</td></tr>
              <tr><td className="py-1">Nama Orang Tua / Wali</td><td>:</td><td>{selectedStudentForLetter.ayah.nama}</td></tr>
              <tr><td className="py-1">Alamat Asal</td><td>:</td><td>{selectedStudentForLetter.alamat}, Desa {selectedStudentForLetter.kelurahanDesa}</td></tr>
            </tbody>
          </table>

          <p className="indent-8 text-justify mb-2">
            Sesuai surat permohonan pindah sekolah dari orang tua/wali siswa tertanggal {formatIndonesianDate(selectedStudentForLetter.mutasi?.tglMeninggalkan || new Date().toISOString())}, bahwa peserta didik tersebut di atas mengajukan permohonan pindah sekolah ke:
          </p>

          <table className="w-full border-collapse text-[12px] ml-4 mb-4">
            <tbody>
              <tr><td className="w-48 py-1">Nama Sekolah Tujuan</td><td className="w-3">:</td><td className="font-bold">{selectedStudentForLetter.mutasi?.sekolahTujuan}</td></tr>
              <tr><td className="py-1">Alasan Pindah</td><td>:</td><td>{selectedStudentForLetter.mutasi?.alasanPindah}</td></tr>
            </tbody>
          </table>

          <p className="indent-8 text-justify mb-8">
            Demikian Surat Keterangan Pindah Sekolah ini kami terbitkan dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Buku Induk dan Raport siswa telah disesuaikan.
          </p>

          <div className="flex justify-between items-end font-sans text-[11px]">
            <div className="text-center">
              <div>Mengetahui Orang Tua / Wali,</div>
              <div className="h-16" />
              <div className="font-bold underline">{selectedStudentForLetter.ayah.nama}</div>
            </div>

            <div className="text-right leading-tight">
              <div>{schoolProfile.desaKelurahan || schoolProfile.desa || 'Sungai Buluh'}, {formatIndonesianDate(selectedStudentForLetter.mutasi?.tglMeninggalkan || new Date().toISOString())}</div>
              <div className="font-bold mt-0.5">Kepala {schoolProfile.namaSekolah}</div>
              <div className="h-16 flex items-center justify-end relative">
                {schoolProfile.stempelUrl ? (
                  <img
                    src={schoolProfile.stempelUrl}
                    alt="Stempel Sekolah"
                    className="w-24 h-16 object-contain opacity-85 absolute right-4"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-10 border border-blue-900/30 rounded flex items-center justify-center text-[8px] text-blue-900 font-bold">
                    [ STEMPEL RESMI ]
                  </div>
                )}
              </div>
              <div className="font-bold underline relative z-10">{schoolProfile.namaKepalaSekolah}</div>
              <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
            </div>
          </div>
        </div>
      )}

      {/* FORMAL LAPORAN REKAPITULASI MUTASI & SISWA PINDAH (SHEET TINGGALKAN) */}
      {(isPrintingRekap || !selectedStudentForLetter) && (
        <div className={cn(
          "max-w-[297mm] mx-auto bg-white text-slate-950 p-[12mm] shadow-2xl rounded-sm font-serif text-[11px] leading-relaxed border border-slate-300 print:border-none print:shadow-none print:m-0 print:w-full",
          !isPrintingRekap && "hidden print:block"
        )}>
          <KopSuratHeader
            schoolProfile={schoolProfile}
            documentTitle="BUKU REGISTER MUTASI PESERTA DIDIK"
            documentSubtitle="LAPORAN REKAPITULASI PESERTA DIDIK PINDAH / MENINGGALKAN SEKOLAH (SHEET TINGGALKAN)"
          />

          <div className="my-3 text-xs font-sans text-slate-700">
            <p>Daftar resmi peserta didik yang tercatat pindah / meninggalkan {schoolProfile.namaSekolah}:</p>
          </div>

          <table className="w-full border-collapse border border-slate-950 text-[10px] my-3">
            <thead>
              <tr className="bg-slate-100 text-slate-950 font-bold">
                <th className="border border-slate-950 px-2 py-1 text-center w-8">No</th>
                <th className="border border-slate-950 px-2 py-1 text-center w-24">NIS / NISN</th>
                <th className="border border-slate-950 px-2 py-1 text-left">Nama Peserta Didik</th>
                <th className="border border-slate-950 px-2 py-1 text-center w-10">L/P</th>
                <th className="border border-slate-950 px-2 py-1 text-center w-16">Dari Kelas</th>
                <th className="border border-slate-950 px-2 py-1 text-center w-24">Tgl Keluar</th>
                <th className="border border-slate-950 px-2 py-1 text-left w-36">No. Surat Pindah</th>
                <th className="border border-slate-950 px-2 py-1 text-left">Sekolah Tujuan</th>
                <th className="border border-slate-950 px-2 py-1 text-left">Alasan Pindah</th>
              </tr>
            </thead>
            <tbody>
              {filteredMutated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-slate-950 px-3 py-4 text-center text-slate-500 italic">
                    Belum ada catatan peserta didik mutasi / pindah sekolah.
                  </td>
                </tr>
              ) : (
                filteredMutated.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="border border-slate-950 px-2 py-1 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-950 px-2 py-1 text-center font-mono">{s.noInduk} / {s.nisn}</td>
                    <td className="border border-slate-950 px-2 py-1 font-bold uppercase">{s.namaLengkap}</td>
                    <td className="border border-slate-950 px-2 py-1 text-center">{s.jenisKelamin}</td>
                    <td className="border border-slate-950 px-2 py-1 text-center">{s.mutasi?.dariKelas || s.kelasSekarang}</td>
                    <td className="border border-slate-950 px-2 py-1 text-center">{formatIndonesianDate(s.mutasi?.tglMeninggalkan || s.tanggalPembaruan)}</td>
                    <td className="border border-slate-950 px-2 py-1 font-mono text-[9px]">{s.mutasi?.noSuratPindah || '-'}</td>
                    <td className="border border-slate-950 px-2 py-1 font-semibold">{s.mutasi?.sekolahTujuan || '-'}</td>
                    <td className="border border-slate-950 px-2 py-1">{s.mutasi?.alasanPindah || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-end font-sans text-[11px] mt-6">
            <div className="text-center">
              <div>Mengetahui,</div>
              <div>Pengelola / Petugas Buku Induk</div>
              <div className="h-16" />
              <div className="font-bold underline">Administrator / Operator</div>
              <div>NIP. -</div>
            </div>

            <div className="text-right leading-tight">
              <div>{schoolProfile.desaKelurahan || schoolProfile.desa || 'Sungai Buluh'}, {formatIndonesianDate(new Date().toISOString())}</div>
              <div className="font-bold mt-0.5">Kepala {schoolProfile.namaSekolah}</div>
              <div className="h-16 flex items-center justify-end relative">
                {schoolProfile.stempelUrl ? (
                  <img
                    src={schoolProfile.stempelUrl}
                    alt="Stempel Sekolah"
                    className="w-24 h-16 object-contain opacity-85 absolute right-4"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-24 h-10 border border-blue-900/30 rounded flex items-center justify-center text-[8px] text-blue-900 font-bold">
                    [ STEMPEL RESMI ]
                  </div>
                )}
              </div>
              <div className="font-bold underline relative z-10">{schoolProfile.namaKepalaSekolah}</div>
              <div>NIP. {schoolProfile.nipKepalaSekolah}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

