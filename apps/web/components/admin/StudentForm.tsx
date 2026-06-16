'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminPost, adminPatch } from '@/lib/admin-api';

interface StudentFormData {
  nama: string;
  kelas: string;
  jabatan: string;
  ttl: string;
  kesan: string;
  pesan: string;
  ekstra: string;
  image_path: string;
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>;
  studentId?: string;
}

const KELAS_OPTIONS = [
  'XII IPA 1', 'XII IPA 2', 'XII IPA 3', 'XII IPA 4',
  'XII IPS 1', 'XII IPS 2', 'XII IPS 3', 'XII PAI',
];

const JABATAN_SISWA = [
  'Ketua Kelas', 'Wakil Ketua', 'Sekretaris', 'Bendahara', 'Anggota',
];

export function StudentForm({ initialData, studentId }: StudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<StudentFormData>({
    nama: initialData?.nama || '',
    kelas: initialData?.kelas || 'XII IPA 1',
    jabatan: initialData?.jabatan || 'Anggota',
    ttl: initialData?.ttl || '',
    kesan: initialData?.kesan || '',
    pesan: initialData?.pesan || '',
    ekstra: initialData?.ekstra || '',
    image_path: initialData?.image_path || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (studentId) {
        await adminPatch(`/api/admin/students/${studentId}`, form);
      } else {
        await adminPost('/api/admin/students', form);
      }
      router.push('/dashboard/students');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input
          type="text"
          required
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Nama lengkap siswa"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select
            value={form.kelas}
            onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {KELAS_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
          <select
            value={form.jabatan}
            onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {JABATAN_SISWA.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
          <input
            type="date"
            value={form.ttl}
            onChange={(e) => setForm({ ...form, ttl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ekstrakurikuler</label>
          <input
            type="text"
            value={form.ekstra}
            onChange={(e) => setForm({ ...form, ekstra: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="OSIS, Pramuka, dll"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kesan</label>
        <textarea
          value={form.kesan}
          onChange={(e) => setForm({ ...form, kesan: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Kesan selama sekolah..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
        <textarea
          value={form.pesan}
          onChange={(e) => setForm({ ...form, pesan: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Pesan untuk teman-teman..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : studentId ? 'Simpan Perubahan' : 'Tambah Siswa'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/students')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
