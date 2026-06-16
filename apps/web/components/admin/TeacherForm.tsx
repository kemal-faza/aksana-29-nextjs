'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminPost, adminPatch } from '@/lib/admin-api';

interface TeacherFormData {
  nama: string;
  jabatan: string;
  mapel: string[];
  ekstra: string;
  image_path: string;
  urutan: number;
}

interface TeacherFormProps {
  initialData?: Partial<TeacherFormData>;
  teacherId?: string;
}

const JABATAN_TEACHER = [
  'Kepala Madrasah',
  'Kepala Tata Usaha',
  'Wakil Kepala Madrasah',
  'Staff Tata Usaha',
  'Wali Kelas',
  'Dewan Guru',
  'Guru BP/BK',
  'Kebersihan dan Keamanan',
];

export function TeacherForm({ initialData, teacherId }: TeacherFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapelInput, setMapelInput] = useState('');
  const [form, setForm] = useState<TeacherFormData>({
    nama: initialData?.nama || '',
    jabatan: initialData?.jabatan || 'Dewan Guru',
    mapel: initialData?.mapel || [],
    ekstra: initialData?.ekstra || '',
    image_path: initialData?.image_path || '',
    urutan: initialData?.urutan || 0,
  });

  const addMapel = () => {
    if (mapelInput.trim() && !form.mapel.includes(mapelInput.trim())) {
      setForm({ ...form, mapel: [...form.mapel, mapelInput.trim()] });
      setMapelInput('');
    }
  };

  const removeMapel = (index: number) => {
    setForm({ ...form, mapel: form.mapel.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (teacherId) {
        await adminPatch(`/api/admin/teachers/${teacherId}`, form);
      } else {
        await adminPost('/api/admin/teachers', form);
      }
      router.push('/dashboard/teachers');
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
          placeholder="Nama lengkap guru"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
        <select
          value={form.jabatan}
          onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {JABATAN_TEACHER.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={mapelInput}
            onChange={(e) => setMapelInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMapel())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tambah mapel lalu Enter"
          />
          <button
            type="button"
            onClick={addMapel}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Tambah
          </button>
        </div>
        {form.mapel.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.mapel.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {m}
                <button type="button" onClick={() => removeMapel(i)} className="hover:text-red-600">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ekstrakurikuler</label>
        <input
          type="text"
          value={form.ekstra}
          onChange={(e) => setForm({ ...form, ekstra: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ekstrakurikuler yang dibina"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : teacherId ? 'Simpan Perubahan' : 'Tambah Guru'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/teachers')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
