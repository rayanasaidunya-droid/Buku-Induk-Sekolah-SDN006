import React, { useState, useEffect, useRef } from 'react';
import { X, UserMinus, Save, AlertTriangle, Upload, Trash2, Eye, AlertCircle, Loader2, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { Student, MutationRecord } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { compressImageFile } from '../../utils/imageCompressor';
import { IjazahViewerModal } from './IjazahViewerModal';

interface MutationModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, mutation: MutationRecord) => void;
}

export const MutationModal: React.FC<MutationModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const { cancelMutation, currentRole, rolePermissions, schoolProfile } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<MutationRecord>({
    tglMeninggalkan: new Date().toISOString().split('T')[0],
    dariKelas: '',
    sekolahTujuan: '',
    alasanPindah: '',
    noSuratPindah: '',
    keterangan: 'Buku Induk dan Surat Keterangan Pindah Sekolah telah diterbitkan.',
    fotoIjazah: '',
    tglUploadIjazah: undefined,
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [restoreClassChoice, setRestoreClassChoice] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        tglMeninggalkan: student.mutasi?.tglMeninggalkan || new Date().toISOString().split('T')[0],
        dariKelas: student.mutasi?.dariKelas || student.kelasSekarang || 'Kelas 6',
        sekolahTujuan: student.mutasi?.sekolahTujuan || '',
        alasanPindah: student.mutasi?.alasanPindah || 'Mengikuti orang tua pindah domisili',
        noSuratPindah: student.mutasi?.noSuratPindah || `421.2/SDN-006/KP/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        keterangan: student.mutasi?.keterangan || 'Buku Induk dan Surat Keterangan Pindah Sekolah telah diterbitkan.',
        fotoIjazah: student.mutasi?.fotoIjazah || '',
        tglUploadIjazah: student.mutasi?.tglUploadIjazah,
      });
      setRestoreClassChoice(student.mutasi?.dariKelas || student.kelasSekarang || 'Kelas 1');
      setShowCancelConfirm(false);
      setUploadError(null);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Berkas harus berupa gambar berformat JPG, JPEG, PNG, atau WEBP.');
      return;
    }
    setUploadError(null);
    setIsCompressing(true);
    try {
      const result = await compressImageFile(file, 1400, 1400, 0.85);
      setFormData(prev => ({
        ...prev,
        fotoIjazah: result.dataUrl,
        tglUploadIjazah: new Date().toISOString(),
      }));
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses berkas gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      fotoIjazah: '',
      tglUploadIjazah: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(student.id, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-orange-600 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <UserMinus className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                {student.mutasi ? 'Edit Catatan Mutasi Siswa' : 'Proses Mutasi Siswa (Meninggalkan Sekolah)'}
              </h3>
              <p className="text-[11px] text-orange-100">
                {student.mutasi ? 'Perbarui rincian data mutasi pada Lembar Tinggalkan Buku Induk' : 'Pencatatan Buku Induk Lembar Tinggalkan'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student summary banner */}
        <div className="px-6 py-3 bg-orange-50 dark:bg-orange-950/40 border-b border-orange-200 dark:border-orange-900 text-xs shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-800 dark:text-slate-200">{student.namaLengkap}</span>
            <span className="font-mono text-slate-600 dark:text-slate-400">NIS: {student.noInduk}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Kelas saat ini: {student.kelasSekarang}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Meninggalkan Sekolah <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.tglMeninggalkan || ''}
              onChange={(e) => setFormData({ ...formData, tglMeninggalkan: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Meninggalkan Dari Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.dariKelas || ''}
              onChange={(e) => setFormData({ ...formData, dariKelas: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="Contoh: Kelas 4"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Sekolah Tujuan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.sekolahTujuan || ''}
              onChange={(e) => setFormData({ ...formData, sekolahTujuan: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="Contoh: SDN 001 Teluk Kuantan"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Pindah / Meninggalkan Sekolah <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formData.alasanPindah || ''}
              onChange={(e) => setFormData({ ...formData, alasanPindah: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              placeholder="Alasan mutasi..."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Surat Pindah Sekolah
            </label>
            <input
              type="text"
              value={formData.noSuratPindah || ''}
              onChange={(e) => setFormData({ ...formData, noSuratPindah: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
              placeholder="421.2/SDN-006/..."
            />
          </div>

          {/* Upload Scan / Gambar Ijazah atau Dokumen Mutasi */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Upload Scan / Foto Ijazah atau Dokumen Mutasi</span>
              </label>
              {formData.fotoIjazah && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Gambar Terlampir</span>
                </span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {formData.fotoIjazah ? (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    onClick={() => setIsViewerOpen(true)}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group shrink-0 bg-slate-100 dark:bg-slate-800 shadow-xs"
                    title="Klik untuk memperbesar gambar ijazah/mutasi"
                  >
                    <img
                      src={formData.fotoIjazah}
                      alt="Pratinjau Ijazah/Mutasi"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      Dokumen: {formData.sekolahTujuan || student.namaLengkap}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Tersimpan untuk ditampilkan di profil peserta didik
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsViewerOpen(true)}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat Ukuran Penuh (Pratinjau)</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ganti Gambar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 bg-white dark:bg-slate-900/60 ${
                  isDragging
                    ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/40"
                    : "border-slate-300 dark:border-slate-700 hover:border-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {isCompressing ? (
                  <div className="flex items-center gap-2 text-orange-600 font-bold py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengoptimalkan berkas gambar...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Pilih atau Seret Foto / Scan Ijazah atau Dokumen Mutasi
                    </div>
                    <p className="text-[11px] text-slate-500 max-w-sm">
                      Upload foto ijazah/surat pindah untuk ditampilkan di profil peserta didik & arsip digital Buku Induk
                    </p>
                  </>
                )}
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Cancel Mutation Confirmation Box */}
            {showCancelConfirm && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs">Konfirmasi Pembatalan Mutasi</h4>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                      Catatan mutasi siswa <strong>{student.namaLengkap}</strong> akan dihapus dan status siswa dikembalikan menjadi <strong>AKTIF</strong> di Buku Induk.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    Kembalikan ke Kelas Aktif:
                  </label>
                  <select
                    value={restoreClassChoice}
                    onChange={(e) => setRestoreClassChoice(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    {(schoolProfile?.daftarKelas && schoolProfile.daftarKelas.length > 0
                      ? schoolProfile.daftarKelas
                      : ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6']
                    ).map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200 dark:border-rose-900/60">
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      cancelMutation(student.id, restoreClassChoice);
                      setShowCancelConfirm(false);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ya, Batalkan Mutasi & Aktifkan</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              {student.mutasi && currentRole !== 'umum' && rolePermissions?.inputMutasi !== false && !showCancelConfirm && (
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto"
                  title="Batalkan mutasi dan kembalikan siswa menjadi aktif di Buku Induk"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Batalkan Mutasi</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>{student.mutasi ? 'Simpan Perubahan Mutasi' : 'Simpan Catatan Mutasi'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lightbox / Fullscreen Viewer */}
      {isViewerOpen && formData.fotoIjazah && (
        <IjazahViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          imageUrl={formData.fotoIjazah}
          student={student}
        />
      )}
    </div>
  );
};
